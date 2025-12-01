import { useState, useCallback } from 'react';
import { JSONContent } from '@tiptap/react';
import { useChatSession } from './useChatSession';
import { chatKeys } from './useChat';
import { chatService } from '../services/chat.service';
import { encryptText, encryptFile } from '@/features/crypto/utils/cryptions';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { mapMessageDtoToDomain } from '../utils/chat.mapper';
import { ChatMessage, SendMessageVariables } from '../types/chat';
import { SendMessageRequestDto } from '../services/chat.dto';

export const useChatMessages = (
  conversationId: string,
  recipientId: string
) => {
  const { sharedKey, isLoading: isKeyLoading } = useChatSession(recipientId);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading,
  } = useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      chatService.getMessages(conversationId, { cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
    staleTime: 0,
  });

  const serverMessages: ChatMessage[] =
    data?.pages.flatMap((page) =>
      page.data.map((dto) => {
        const domainMsg = mapMessageDtoToDomain(dto);
        return {
          ...domainMsg,
          content: null, // Will be decrypted by component
          encryptedContent: domainMsg.content,
          status: 'sent',
          media: domainMsg.mediaUrl
            ? {
                url: domainMsg.mediaUrl,
                type: domainMsg.type as 'image' | 'video',
              }
            : undefined,
        };
      })
    ) || [];

  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>(
    []
  );

  const sendMessageMutation = useMutation({
    mutationFn: (variables: SendMessageVariables) =>
      chatService.sendMessage(variables),
    onSuccess: (data, variables) => {
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.id !== variables.tempId)
      );
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
    },
    onError: (error, variables) => {
      toast.error('Gửi tin nhắn thất bại');
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === variables.tempId ? { ...msg, status: 'error' } : msg
        )
      );
    },
  });

  const sendMessage = useCallback(
    async (
      content: JSONContent | null,
      media?: { file: File; previewUrl: string }
    ) => {
      if (!sharedKey) {
        toast.error(
          'Đang thiết lập kết nối bảo mật. Vui lòng thử lại sau giây lát.'
        );
        return;
      }

      const tempId = crypto.randomUUID();
      const contentStr = JSON.stringify(content || {});

      const { cipherText, nonce } = encryptText(contentStr, sharedKey);
      let encryptedFile: { blob: Blob; nonce: string } | undefined;

      if (media) {
        encryptedFile = await encryptFile(media.file, sharedKey);
      }

      const newMessage: ChatMessage = {
        id: tempId,
        conversationId: conversationId,
        sender: 'me',
        type: media ? 'image' : 'text',
        content,
        encryptedContent: cipherText,
        nonce,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sending',
        media: media ? { url: media.previewUrl, type: 'image' } : undefined,
      };

      setOptimisticMessages((prev) => [newMessage, ...prev]);

      const sendMessageDto: SendMessageRequestDto = {
        receiverId: recipientId,
        type: media ? 'image' : 'text',
        content: cipherText,
        nonce: nonce,
        file: encryptedFile?.blob,
      };

      sendMessageMutation.mutate({
        ...sendMessageDto,
        tempId,
      });
    },
    [conversationId, recipientId, sharedKey, sendMessageMutation]
  );

  const messages = [...optimisticMessages, ...serverMessages];

  return {
    messages,
    sendMessage,
    sharedKey,
    isLoading: isKeyLoading || isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
