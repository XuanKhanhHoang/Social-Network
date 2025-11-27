import { useQueryClient } from '@tanstack/react-query';
import { Notification, NotificationType } from '@/lib/types/notification';
import { useUpdatePostCache } from './post/usePostCache';
import { friendshipKeys } from './friendship/friendshipKeys';
import { userKeys } from './user/useUser';
import { postKeys } from './post/usePost';
import { ReactionType } from '@/lib/constants/enums';
import { useCallback } from 'react';

export function useSocketCacheUpdater() {
  const queryClient = useQueryClient();
  const postCache = useUpdatePostCache();

  const handleSocketNotification = useCallback(
    (notification: Notification, currentUsername?: string) => {
      switch (notification.type) {
        case NotificationType.POST_LIKED:
          if (notification.relatedId) {
            postCache.updateReactionFromSocket(
              notification.relatedId,
              ReactionType.LIKE,
              true
            );
            queryClient.invalidateQueries({
              queryKey: postKeys.detail(notification.relatedId),
            });
          }
          break;

        case NotificationType.POST_COMMENTED:
          if (notification.relatedId) {
            postCache.incrementComments(notification.relatedId);
            queryClient.invalidateQueries({
              queryKey: postKeys.detail(notification.relatedId),
            });
          }
          break;

        case NotificationType.FRIEND_REQUEST_ACCEPTED:
          queryClient.invalidateQueries({ queryKey: friendshipKeys.friends() });
          if (currentUsername) {
            queryClient.invalidateQueries({
              queryKey: userKeys.header(currentUsername),
            });
            queryClient.invalidateQueries({
              queryKey: userKeys.profile(currentUsername),
            });
            queryClient.invalidateQueries({
              queryKey: friendshipKeys.received(),
            });
            queryClient.invalidateQueries({
              queryKey: friendshipKeys.sent(),
            });
          }
          break;

        case NotificationType.FRIEND_REQUEST_SENT:
          queryClient.invalidateQueries({
            queryKey: friendshipKeys.received(),
          });
          break;

        case NotificationType.COMMENT_LIKED:
        case NotificationType.COMMENT_REPLY_CREATED:
          // Optional: Handle comment updates
          break;
      }
    },
    [queryClient, postCache]
  );

  return { handleSocketNotification };
}
