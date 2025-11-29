import { useRouter } from 'next/navigation';
import { Notification } from '../types';
import { useMarkAsReadMutation } from './useNotifications';
import { NotificationType } from '../const';

export const useNotificationNavigation = () => {
  const router = useRouter();
  const { mutate: markAsRead } = useMarkAsReadMutation();

  const handleNavigate = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    try {
      switch (notification.type) {
        case NotificationType.FRIEND_REQUEST_SENT:
          if (notification.sender?.id) {
            router.push(`/user/${notification.sender.username}`);
          } else {
            console.warn('Notification missing sender ID:', notification);
          }
          break;

        case NotificationType.FRIEND_REQUEST_ACCEPTED:
          if (notification.sender?.id) {
            router.push(`/user/${notification.sender.username}`);
          } else {
            router.push('/friends');
          }
          break;

        case NotificationType.POST_LIKED:
        case NotificationType.POST_COMMENTED:
          if (notification.relatedId) {
            router.push(`/post/${notification.relatedId}`);
          } else {
            console.warn(
              'Notification missing relatedId (Post ID):',
              notification
            );
          }
          break;

        case NotificationType.COMMENT_LIKED:
        case NotificationType.COMMENT_REPLY_CREATED:
          const postId = notification.metadata?.postId;

          if (postId) {
            router.push(`/post/${postId}`);
          } else if (
            notification.relatedModel === 'Post' &&
            notification.relatedId
          ) {
            router.push(`/post/${notification.relatedId}`);
          } else {
            console.warn(
              'Cannot navigate: Missing postId in metadata for comment notification',
              notification
            );
          }
          break;

        default:
          console.warn('Unhandled notification type:', notification.type);
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return { handleNavigate };
};
