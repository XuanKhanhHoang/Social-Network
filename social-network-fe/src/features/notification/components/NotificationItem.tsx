import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../types';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationType } from '../const';
import { Heart, MessageCircle, UserPlus, Reply, Bell } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.FRIEND_REQUEST_SENT:
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return <UserPlus className="h-3 w-3 text-white" />;
    case NotificationType.POST_LIKED:
    case NotificationType.COMMENT_LIKED:
      return <Heart className="h-3 w-3 text-white fill-white" />;
    case NotificationType.POST_COMMENTED:
      return <MessageCircle className="h-3 w-3 text-white" />;
    case NotificationType.COMMENT_REPLY_CREATED:
      return <Reply className="h-3 w-3 text-white" />;
    default:
      return <Bell className="h-3 w-3 text-white" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case NotificationType.FRIEND_REQUEST_SENT:
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return 'bg-blue-400';
    case NotificationType.POST_LIKED:
    case NotificationType.COMMENT_LIKED:
      return 'bg-rose-400';
    case NotificationType.POST_COMMENTED:
    case NotificationType.COMMENT_REPLY_CREATED:
      return 'bg-green-400';
    default:
      return 'bg-primary';
  }
};

const getNotificationText = (type: NotificationType) => {
  switch (type) {
    case NotificationType.FRIEND_REQUEST_SENT:
      return 'Đã gửi cho bạn một lời mời kết bạn';
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return 'Đã chấp nhận lời mời kết bạn của bạn';
    case NotificationType.POST_LIKED:
      return 'Đã thích bài viết của bạn';
    case NotificationType.POST_COMMENTED:
      return 'Đã bình luận bài viết của bạn';
    case NotificationType.COMMENT_LIKED:
      return 'Đã thích bình luận của bạn';
    case NotificationType.COMMENT_REPLY_CREATED:
      return 'Đã trả lời bình luận của bạn';
    default:
      return 'Có 1 thông báo mới';
  }
};

export const NotificationItem = ({
  notification,
  onClick,
}: NotificationItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      onClick={() => onClick(notification)}
      className={cn(
        'group flex items-start gap-4 p-4 cursor-pointer transition-all duration-200 border-b border-border/40 hover:bg-muted/50 last:border-0',
        !notification.isRead ? 'bg-muted/30' : 'bg-background'
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar
          name={notification.sender.firstName}
          src={notification.sender?.avatar || ''}
          className="h-10 w-10 border border-border"
        />
        <div
          className={cn(
            'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-background',
            getNotificationColor(notification.type)
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-sm leading-snug">
          <span className="font-semibold text-foreground mr-1">
            {notification.sender.firstName} {notification.sender.lastName}
          </span>
          <span className="text-muted-foreground">
            {getNotificationText(notification.type)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground/70 font-medium">
          {timeAgo}
        </p>
      </div>

      {!notification.isRead && (
        <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shrink-0" />
      )}
    </div>
  );
};
