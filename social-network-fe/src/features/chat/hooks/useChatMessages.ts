import { useCallback } from 'react';
import { JSONContent } from '@tiptap/react';
import { useChatSession } from './useChatSession';
import { chatKeys } from './useChat';
import { chatService } from '../services/chat.service';
import { encryptText, encryptFile } from '@/features/crypto/utils/cryptions';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { mapMessageDtoToDomain } from '../utils/chat.mapper';
import { ChatMessage, SendMessageVariables } from '../types/chat';
import {
  MessageResponseDto,
  MessagesResponseDto,
  SendMessageRequestDto,
} from '../services/chat.dto';
import { useStore } from '@/store';

export const useChatMessages = (
  conversationId: string,
  recipientId: string
) => {
  const { sharedKey, isLoading: isKeyLoading } = useChatSession(recipientId);
  const queryClient = useQueryClient();
  const user = useStore((state) => state.user);

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
    staleTime: Infinity,
  });

  const messages: ChatMessage[] =
    data?.pages.flatMap((page) =>
      page.data.map((dto) => {
        const domainMsg = mapMessageDtoToDomain(dto);
        return {
          ...domainMsg,
          content: null,
          encryptedContent: domainMsg.content,
          status: dto.status || 'sent',
          media: domainMsg.media,
        };
      })
    ) || [];

  const sendMessageMutation = useMutation({
    mutationFn: (variables: SendMessageVariables & { previewUrl?: string }) =>
      chatService.sendMessage(variables),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });
      const previousMessages = queryClient.getQueryData(
        chatKeys.messages(conversationId)
      );

      if (user) {
        const optimisticMessageDto: MessageResponseDto = {
          _id: variables.tempId,
          conversationId: conversationId,
          content: variables.content,
          sender: {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            avatar: user.avatar,
          },
          nonce: variables.nonce,
          type: variables.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readBy: [],
          media: variables.file
            ? {
                url: variables.previewUrl || '',
                mediaType: 'image',
                width: 0,
                height: 0,
                mediaId: '',
              }
            : null,
          status: 'sending',
        } as unknown as MessageResponseDto;

        queryClient.setQueryData<InfiniteData<MessagesResponseDto>>(
          chatKeys.messages(conversationId),
          (old) => {
            if (!old) {
              return {
                pages: [
                  {
                    data: [optimisticMessageDto],
                    pagination: { hasMore: false, nextCursor: null, total: 1 },
                  },
                ],
                pageParams: [undefined],
              };
            }
            const newPages = [...old.pages];
            if (newPages.length > 0) {
              newPages[0] = {
                ...newPages[0],
                data: [optimisticMessageDto, ...newPages[0].data],
              };
            }
            return { ...old, pages: newPages };
          }
        );
      }
      return { previousMessages };
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (old: InfiniteData<MessagesResponseDto, string | undefined>) => {
          if (!old) return old;
          const newPages = old.pages.map((page) => ({
            ...page,
            data: page.data.map((msg) => {
              if (msg._id === variables.tempId) {
                const finalMessage = { ...data, status: 'sent' };
                const previewUrl = variables.previewUrl;
                if (previewUrl && finalMessage.media) {
                  finalMessage.media.url = previewUrl;
                }
                return finalMessage;
              }
              return msg;
            }),
          }));
          return { ...old, pages: newPages };
        }
      );

      if (data.conversationId && data.conversationId !== conversationId) {
        queryClient.setQueryData(
          chatKeys.conversationId(recipientId),
          data.conversationId
        );
      }
    },

    onError: (err, variables, context) => {
      toast.error('Gửi tin nhắn thất bại');
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.previousMessages
        );
      }
    },
  });

  const sendMessage = useCallback(
    async (
      content: JSONContent | null,
      media?: { file: File; previewUrl: string }
    ) => {
      if (!sharedKey || !user) {
        toast.error('Đang thiết lập kết nối bảo mật...');
        return;
      }

      const tempId = crypto.randomUUID();
      const contentStr = JSON.stringify(content || {});
      const { cipherText, nonce } = encryptText(contentStr, sharedKey);
      let encryptedFile: { blob: Blob; nonce: string } | undefined;

      if (media) {
        encryptedFile = await encryptFile(media.file, sharedKey);
      }

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
        previewUrl: media?.previewUrl,
      });
    },
    [sharedKey, user, recipientId, sendMessageMutation]
  );

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
