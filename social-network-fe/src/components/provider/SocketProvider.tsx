'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store';
import { toast } from 'sonner';
import { Notification } from '@/features/notification/types';
import { SocketEvents } from '@/lib/constants/socket';
import { useSocketCacheUpdater } from '@/features/notification/hooks/useSocketCacheUpdater';
import { NotificationType } from '@/features/notification/const';
import { NotificationDto } from '@/features/notification/services/notification.dto';
import { mapNotificationDtoToDomain } from '@/features/notification/utils/mapper';
import { useQueryClient } from '@tanstack/react-query';
import { MessageResponseDto } from '@/features/chat/services/chat.dto';
import { mapMessageDtoToDomain } from '@/features/chat/utils/chat.mapper';

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

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const addNotification = useStore((state) => state.addNotification);
  const user = useStore((state) => state.user);
  const { handleSocketNotification } = useSocketCacheUpdater();
  const queryClient = useQueryClient();

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

            const friendId =
              message.sender.id === user.id
                ? message.conversationId
                : message.sender.id;

            queryClient.invalidateQueries({
              queryKey: ['chat', 'messages', friendId],
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
  }, [user, addNotification, handleSocketNotification, queryClient]);

  return <>{children}</>;
};
