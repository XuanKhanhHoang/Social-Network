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
} from '@/features/chat/services/chat.dto';
import { mapMessageDtoToDomain } from '@/features/chat/utils/chat.mapper';
import { useChatContext } from '@/features/chat/context/ChatContext';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000';

const getNotificationMessage = (notification: Notification): string => {
  const name = `${notification.sender.firstName} ${notification.sender.lastName}`;
  switch (notification.type) {
    case NotificationType.FRIEND_REQUEST_SENT:
      return `${name} đã gửi lời mời kết bạn.`;
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return `${name} đã chấp nhận lời mời kết bạn.`;
    case NotificationType.POST_LIKED:
      return `${name} đã thích bài viết của bạn.`;
    case NotificationType.POST_COMMENTED:
      return `${name} đã bình luận về bài viết của bạn.`;
    case NotificationType.COMMENT_LIKED:
      return `${name} đã thích bình luận của bạn.`;
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

  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

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
        socketRef.current.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });
        socketRef.current.on('error', (err) => {
          console.error('Socket error:', err);
        });
        socketRef.current.on(
          SocketEvents.NEW_NOTIFICATION,
          (data: NotificationDto) => {
            const notification = mapNotificationDtoToDomain(data);
            addNotification(notification);
            handleSocketNotification(notification, user.username);

            const message = getNotificationMessage(notification);
            toast(message);
          }
        );

        socketRef.current.on(
          SocketEvents.NEW_MESSAGE,
          (data: MessageResponseDto) => {
            const message = mapMessageDtoToDomain(data);
            const senderId = message.sender.id;

            queryClient.setQueryData<InfiniteData<MessagesResponseDto>>(
              ['chat', 'messages', message.conversationId],
              (oldData) => {
                if (!oldData) return undefined;

                const exists = oldData.pages.some((page) =>
                  page.data.some((m) => m._id === message.id)
                );
                if (exists) return oldData;

                const newPages = [...oldData.pages];
                if (newPages.length > 0) {
                  newPages[0] = {
                    ...newPages[0],
                    data: [data, ...newPages[0].data],
                  };
                }

                return {
                  ...oldData,
                  pages: newPages,
                };
              }
            );

            if (senderId === user.id) return;

            let isOpen = false;
            sessionsRef.current.forEach((s) => {
              if (s.id === senderId) {
                isOpen = true;
                if (s.isMinimized) {
                  s.isMinimized = false;
                }
              }
            });
            if (!isOpen) {
              openSession({
                type: 'private',
                data: {
                  _id: message.sender.id,
                  firstName: message.sender.firstName,
                  lastName: message.sender.lastName,
                  username: message.sender.username,
                  avatar: {
                    url: message.sender.avatar?.url || '',
                  },
                },
              });
            }
          }
        );

        socketRef.current.on(
          SocketEvents.MESSAGE_READ,
          (payload: { conversationId: string; readerId: string }) => {
            queryClient.invalidateQueries({
              queryKey: ['chat', 'messages', payload.conversationId],
            });
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
  ]);

  return <>{children}</>;
};
