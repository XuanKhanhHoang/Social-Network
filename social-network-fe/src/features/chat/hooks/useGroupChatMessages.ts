import { useCallback } from 'react';
import { JSONContent } from '@tiptap/react';
import { chatKeys } from './useChat';
import { chatService } from '../services/chat.service';
import {
  encryptTextMulti,
  encryptFileEnvelope,
} from '@/features/crypto/utils/cryptions';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { mapMessageDtoToDomain } from '../utils/chat.mapper';
import { ChatMessage } from '../types/chat';
import {
  MessageResponseDto,
  MessagesResponseDto,
  SendMessageRequestDto,
} from '../services/chat.dto';
import { useStore } from '@/store';
import { useGroupChat } from './useGroupChat';

export const useGroupChatMessages = (conversationId: string) => {
  const { memberSharedKeys, isMembersLoading } = useGroupChat(conversationId);
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
        const msg = mapMessageDtoToDomain(dto);
        return {
          ...msg,
          encryptedContents: msg.encryptedContents,
          encryptedFileKeys: msg.encryptedFileKeys,
          keyNonce: msg.keyNonce,

          decryptedContent: null,
          status: dto.status || 'sent',
          mediaUrl: msg.mediaUrl,
        } as ChatMessage;
      })
    ) || [];

  const sendMessageMutation = useMutation({
    mutationFn: (
      variables: SendMessageRequestDto & { tempId: string; previewUrl?: string }
    ) => chatService.sendMessage(variables),

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
          content: variables?.content,
          sender: {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            avatar: user.avatar,
          },

          encryptedContents: variables.encryptedContents,
          nonce: variables.nonce,

          mediaNonce: variables.mediaNonce,
          encryptedFileKeys: variables.encryptedFileKeys,
          keyNonce: variables.keyNonce,

          type: variables.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readBy: [],
          mediaUrl: variables.previewUrl,
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
                if (previewUrl && finalMessage.mediaUrl) {
                  finalMessage.mediaUrl = previewUrl;
                }
                return finalMessage;
              }
              return msg;
            }),
          }));
          return { ...old, pages: newPages };
        }
      );

      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },

    onError: (_err, _variables, context) => {
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
      if (!memberSharedKeys.length || !user) {
        toast.error('Đang thiết lập kết nối bảo mật...');
        return;
      }

      const tempId = crypto.randomUUID();

      let nonce: string | undefined;
      let encryptedContents: Record<string, string> | undefined;

      if (content != null) {
        const contentStr = JSON.stringify(content || {});

        const encryptionResult = encryptTextMulti(contentStr, memberSharedKeys);
        nonce = encryptionResult.nonce;
        encryptedContents = encryptionResult.encryptedContents;
      }

      let fileData:
        | {
            blob: Blob;
            mediaNonce: string;
            keyNonce: string;
            encryptedFileKeys: Record<string, string>;
          }
        | undefined;

      if (media) {
        fileData = await encryptFileEnvelope(media.file, memberSharedKeys);
      }

      const sendMessageDto: SendMessageRequestDto = {
        conversationId: conversationId,
        type: media ? 'image' : 'text',

        encryptedContents,
        nonce,

        file: fileData?.blob,
        mediaNonce: fileData?.mediaNonce,
        keyNonce: fileData?.keyNonce,
        encryptedFileKeys: fileData?.encryptedFileKeys,
      };

      sendMessageMutation.mutate({
        ...sendMessageDto,
        tempId,
        previewUrl: media?.previewUrl,
      });
    },
    [memberSharedKeys, user, conversationId, sendMessageMutation]
  );

  const recallMessageMutation = useMutation({
    mutationFn: (messageId: string) => chatService.recallMessage(messageId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });
      const previousMessages = queryClient.getQueryData(
        chatKeys.messages(conversationId)
      );
      queryClient.setQueriesData<InfiniteData<MessagesResponseDto>>(
        {
          queryKey: chatKeys.messages(conversationId),
        },
        (old) => {
          if (!old) return old;
          const newPages = old.pages.map((page) => ({
            ...page,
            data: page.data.map((msg) => {
              if (msg._id == variables) {
                if (msg.mediaUrl?.startsWith('blob:')) {
                  URL.revokeObjectURL(msg.mediaUrl);
                }
                return {
                  ...msg,
                  isRecovered: true,
                  decryptedContent: null,
                  encryptedContents: undefined,
                  encryptedContent: 'recalled',
                  nonce: 'recalled',
                  mediaUrl: undefined,
                  mediaNonce: undefined,
                  keyNonce: undefined,
                  encryptedFileKeys: undefined,
                };
              }
              return msg;
            }),
          }));
          return { ...old, pages: newPages };
        }
      );
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      toast.error('Lỗi khi thu hồi tin nhắn');
      console.error(err);
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.previousMessages
        );
      }
    },
  });

  const recallMessage = useCallback(
    async (messageId: string) => {
      recallMessageMutation.mutate(messageId);
    },
    [recallMessageMutation]
  );

  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) =>
      chatService.markAsRead(conversationId),
    onMutate: async () => {
      // Standard optimistic update for read status
      await queryClient.cancelQueries({
        queryKey: chatKeys.conversations(),
      });
      const previousConversations = queryClient.getQueryData(
        chatKeys.conversations()
      );

      // Optimistic update for messages
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });
      const previousMessages = queryClient.getQueryData(
        chatKeys.messages(conversationId)
      );

      if (user) {
        queryClient.setQueryData<InfiniteData<MessagesResponseDto>>(
          chatKeys.messages(conversationId),
          (old) => {
            if (!old) return old;
            const newPages = old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) => {
                // If message is not from me and I haven't read it, mark as read
                if (
                  msg.sender._id !== user.id &&
                  !msg.readBy.includes(user.id)
                ) {
                  return {
                    ...msg,
                    readBy: [...msg.readBy, user.id],
                  };
                }
                return msg;
              }),
            }));
            return { ...old, pages: newPages };
          }
        );
      }

      return { previousConversations, previousMessages };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.unreadStatus(),
      });
      // Also invalidate messages to update readBy status if needed
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
    },
    onError: (_err, _variables, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(
          chatKeys.conversations(),
          context.previousConversations
        );
      }
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.previousMessages
        );
      }
    },
  });

  const markAsRead = useCallback(
    async (conversationId: string) => {
      markAsReadMutation.mutate(conversationId);
    },
    [markAsReadMutation]
  );

  return {
    messages,
    sendMessage,
    isLoading: isMembersLoading || isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    recallMessage,
    markAsRead,
    memberSharedKeys,
  };
};
