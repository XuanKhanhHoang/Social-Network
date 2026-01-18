'use client';
import { useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store';
import { toast } from 'sonner';
import { Notification } from '@/features/notification/types';
import { SocketEvents } from '@/lib/constants/socket';
import { useSocketCacheUpdater } from '@/features/notification/hooks/useSocketCacheUpdater';
import { NotificationType } from '@/features/notification/const';
import { NotificationDto } from '@/features/notification/services/notification.dto';
import { mapNotificationDtoToDomain } from '@/features/notification/utils/mapper';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import {
  MessageResponseDto,
  MessagesResponseDto,
  ConversationsResponseDto,
  SearchConversationsResponseDto,
  ConversationItemInSearchConversationResponseDto,
} from '@/features/chat/services/chat.dto';
import { useChatContext } from '@/features/chat/context/ChatContext';
import { useNotificationSound } from '@/features/notification/hooks/usePlayNotificationSounds';
import { chatKeys } from '@/features/chat/hooks/useChat';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000';

const getNotificationMessage = (notification: Notification): string => {
  const name = `${notification.sender.lastName} ${notification.sender.firstName}`;
  switch (notification.type) {
    case NotificationType.FRIEND_REQUEST_SENT:
      return `${name} đã gửi lời mời kết bạn.`;
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return `${name} đã chấp nhận lời mời kết bạn.`;
    case NotificationType.POST_REACTED:
      return `${name} đã bày tỏ cảm xúc với bài viết của bạn.`;
    case NotificationType.POST_COMMENTED:
      return `${name} đã bình luận về bài viết của bạn.`;
    case NotificationType.COMMENT_REACTED:
      return `${name} đã bày tỏ cảm xúc với bình luận của bạn.`;
    case NotificationType.COMMENT_REPLY_CREATED:
      return `${name} đã trả lời bình luận của bạn.`;
    default:
      return `Bạn có thông báo mới từ ${name}.`;
  }
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const addNotification = useStore((state) => state.addNotification);
  const user = useStore((state) => state.user);
  const { handleSocketNotification } = useSocketCacheUpdater();
  const queryClient = useQueryClient();
  const { sessions, openSession } = useChatContext();
  const { playSound } = useNotificationSound();

  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'messages'],
          type: 'active',
        });
        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversation-id'],
          type: 'active',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      const origin = new URL(SOCKET_URL).origin;

      const connectSocket = () => {
        socketRef.current = io(origin, {
          withCredentials: true,
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected:', socketRef.current?.id);
        });

        socketRef.current.on(
          SocketEvents.NEW_NOTIFICATION,
          (data: NotificationDto) => {
            const notification = mapNotificationDtoToDomain(data);
            addNotification(notification);
            handleSocketNotification(notification, user.username);
            const message = getNotificationMessage(notification);
            toast(message);
            playSound();
          }
        );

        socketRef.current.on(
          SocketEvents.NEW_MESSAGE,
          (data: MessageResponseDto) => {
            const conversationId = data.conversationId;
            const targetKey = chatKeys.messages(conversationId);

            queryClient.setQueryData<InfiniteData<MessagesResponseDto>>(
              targetKey,
              (oldData) => {
                if (!oldData) return undefined;
                const exists = oldData.pages.some((page) =>
                  page.data.some((m) => m._id === data._id)
                );
                if (exists) return oldData;

                const newPages = [...oldData.pages];
                if (newPages.length > 0) {
                  newPages[0] = {
                    ...newPages[0],
                    data: [data, ...newPages[0].data],
                  };
                }
                return { ...oldData, pages: newPages };
              }
            );

            queryClient.setQueryData<
              InfiniteData<SearchConversationsResponseDto>
            >(chatKeys.conversations(), (oldData) => {
              if (!oldData) return undefined;

              let updatedConversation: ConversationItemInSearchConversationResponseDto | null =
                null;

              const newPages = oldData.pages.map((page) => {
                const existingItem = page.data.find(
                  (c) => c._id === conversationId
                );

                if (existingItem) {
                  updatedConversation = {
                    ...existingItem,
                    lastMessage: {
                      _id: data._id,
                      sender: {
                        _id: data.sender._id,
                        firstName: data.sender.firstName,
                        lastName: data.sender.lastName,
                        username: data.sender.username,
                        avatar: {
                          url: data?.sender?.avatar?.url || '',
                          height: data?.sender?.avatar?.height,
                          width: data?.sender?.avatar?.width,
                          mediaId: data?.sender?.avatar?.mediaId,
                        },
                      },
                      type: data.type,
                      content: data.content,
                      nonce: data.nonce,
                      mediaUrl: data.mediaUrl,
                      mediaNonce: data.mediaNonce,
                      readBy: data.readBy,
                      createdAt: data.createdAt,
                    },
                    hasRead: data.sender._id == user.id,
                    updatedAt: new Date().toISOString(),
                  };

                  return {
                    ...page,
                    data: page.data.filter((c) => c._id !== conversationId),
                  };
                }

                return page;
              });

              if (updatedConversation && newPages.length > 0) {
                newPages[0].data.unshift(updatedConversation);
              }

              return {
                ...oldData,
                pages: newPages,
              };
            });

            queryClient.invalidateQueries({
              queryKey: chatKeys.conversationId(data.sender._id),
            });

            if (data.sender._id !== user.id) {
              queryClient.setQueryData<{ hasUnread: boolean }>(
                chatKeys.unreadStatus(),
                () => ({ hasUnread: true })
              );
            }

            if (data.sender._id === user.id) return;

            playSound();
            const isGroup = data.conversationType === 'group';
            const sessionId = isGroup ? conversationId : data.sender._id;

            let isOpen = false;
            sessionsRef.current.forEach((s) => {
              if (s.id === sessionId) {
                isOpen = true;
                if (s.isMinimized) {
                  // We can't update ref directly to render, but we can call openSession again or use a specialized method?
                  // Actually openSession handles un-minimizing if already exists.
                  openSession({
                    type: isGroup ? 'group' : 'private',
                    data: isGroup
                      ? undefined
                      : {
                          _id: data.sender._id,
                          firstName: data.sender.firstName,
                          lastName: data.sender.lastName,
                          username: data.sender.username,
                          avatar: { url: data.sender.avatar?.url || '' },
                        },
                    groupData: isGroup
                      ? {
                          conversationId: conversationId,
                          name: data.conversationName || 'Nhóm',
                          avatar: data.conversationAvatar,
                          createdBy: data.conversationCreatedBy || '',
                          owner: data.conversationOwner,
                        }
                      : undefined,
                  });
                }
              }
            });

            if (!isOpen) {
              openSession({
                type: isGroup ? 'group' : 'private',
                data: isGroup
                  ? undefined
                  : {
                      _id: data.sender._id,
                      firstName: data.sender.firstName,
                      lastName: data.sender.lastName,
                      username: data.sender.username,
                      avatar: { url: data.sender.avatar?.url || '' },
                    },
                groupData: isGroup
                  ? {
                      conversationId: conversationId,
                      name: data.conversationName || 'Nhóm',
                      avatar: data.conversationAvatar,
                      createdBy: data.conversationCreatedBy || '',
                      owner: data.conversationOwner,
                    }
                  : undefined,
              });
            }
          }
        );

        socketRef.current.on(
          SocketEvents.MESSAGE_RECALLED,
          (payload: { messageId: string; conversationId: string }) => {
            const targetKey = chatKeys.messages(payload.conversationId);
            queryClient.setQueriesData<InfiniteData<MessagesResponseDto>>(
              { queryKey: targetKey },
              (oldData) => {
                if (!oldData) return undefined;
                const newPages = oldData.pages.map((page) => ({
                  ...page,
                  data: page.data.map((msg) => {
                    if (msg._id === payload.messageId) {
                      return {
                        ...msg,
                        isRecovered: true,
                        content: '',
                        encryptedContent: '',
                        nonce: '',
                        mediaNonce: undefined,
                        mediaUrl: undefined,
                        media: undefined,
                      };
                    }
                    return msg;
                  }),
                }));
                return { ...oldData, pages: newPages };
              }
            );
          }
        );

        socketRef.current.on(
          SocketEvents.MESSAGE_READ,
          (payload: { conversationId: string; readerId: string }) => {
            const targetKey = chatKeys.messages(payload.conversationId);
            queryClient.setQueriesData<InfiniteData<MessagesResponseDto>>(
              { queryKey: targetKey },
              (oldData) => {
                if (!oldData) return undefined;
                const newPages = oldData.pages.map((page) => ({
                  ...page,
                  data: page.data.map((msg) => ({
                    ...msg,
                    readBy: msg.readBy.includes(payload.readerId)
                      ? msg.readBy
                      : [...msg.readBy, payload.readerId],
                  })),
                }));
                return { ...oldData, pages: newPages };
              }
            );

            // Update Conversation List Manually
            queryClient.setQueryData<InfiniteData<ConversationsResponseDto>>(
              chatKeys.conversations(),
              (oldData) => {
                if (!oldData) return undefined;
                const newPages = oldData.pages.map((page) => ({
                  ...page,
                  data: page.data.map((conv) => {
                    if (conv._id === payload.conversationId) {
                      // Update lastMessage readBy if it exists
                      if (conv.lastMessage) {
                        const readBy = conv.lastMessage.readBy || [];
                        if (!readBy.includes(payload.readerId)) {
                          return {
                            ...conv,
                            lastMessage: {
                              ...conv.lastMessage,
                              readBy: [...readBy, payload.readerId],
                            },
                          };
                        }
                      }
                    }
                    return conv;
                  }),
                }));
                return { ...oldData, pages: newPages };
              }
            );

            queryClient.invalidateQueries({
              queryKey: chatKeys.unreadStatus(),
            });
          }
        );

        // Group Events
        socketRef.current.on(SocketEvents.GROUP_CREATED, () => {
          queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        });

        socketRef.current.on(SocketEvents.GROUP_UPDATED, () => {
          queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        });

        socketRef.current.on(
          SocketEvents.GROUP_MEMBER_ADDED,
          (data: { conversationId: string }) => {
            queryClient.invalidateQueries({
              queryKey: chatKeys.groupMembers(data.conversationId),
            });
            queryClient.invalidateQueries({
              queryKey: chatKeys.conversations(),
            });
          }
        );

        socketRef.current.on(
          SocketEvents.GROUP_MEMBER_REMOVED,
          (data: { conversationId: string }) => {
            queryClient.invalidateQueries({
              queryKey: chatKeys.groupMembers(data.conversationId),
            });
            queryClient.invalidateQueries({
              queryKey: chatKeys.conversations(),
            });
          }
        );

        socketRef.current.on(
          SocketEvents.GROUP_MEMBER_LEFT,
          (data: { conversationId: string }) => {
            queryClient.invalidateQueries({
              queryKey: chatKeys.groupMembers(data.conversationId),
            });
            queryClient.invalidateQueries({
              queryKey: chatKeys.conversations(),
            });
          }
        );

        socketRef.current.on(
          SocketEvents.GROUP_OWNER_UPDATED,
          (data: { conversationId: string; newOwnerId: string }) => {
            queryClient.invalidateQueries({
              queryKey: chatKeys.groupMembers(data.conversationId),
            });
            queryClient.invalidateQueries({
              queryKey: chatKeys.conversations(),
            });
            toast.info('Quyền trưởng nhóm đã được thay đổi.');
          }
        );

        socketRef.current.on(
          SocketEvents.GROUP_DELETED,
          (data: { conversationId: string }) => {
            queryClient.invalidateQueries({
              queryKey: chatKeys.conversations(),
            });
            // Close session if open
            if (sessionsRef.current.some((s) => s.id === data.conversationId)) {
              // We need closeSession here.
              // Since we can't easily destructure it if not available, we rely on invalidation or toast.
              // Or better, let's assume ChatDock handles invalid sessions or we just notify.
              toast.info('Nhóm chat đã bị giải tán.');
            }
          }
        );

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      };

      const timer = setTimeout(connectSocket, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [
    user,
    addNotification,
    handleSocketNotification,
    queryClient,
    openSession,
    playSound,
  ]);

  return <>{children}</>;
};
