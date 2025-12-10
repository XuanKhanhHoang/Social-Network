import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../types';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationType } from '../const';
import { MessageCircle, UserPlus, Reply, Bell } from 'lucide-react';
import { ReactionType } from '@/lib/constants/enums';

import ThumbsUpFillIcon from '@/assets/emoji/thumbs-up-fill-svgrepo-com.svg';
import HeartIcon from '@/assets/emoji/heart-svgrepo-com.svg';
import HappySmileIcon from '@/assets/emoji/happy-smile-svgrepo-com.svg';
import WowIcon from '@/assets/emoji/wow-svgrepo-com.svg';
import SadTearIcon from '@/assets/emoji/sad-tear-svgrepo-com.svg';
import AngryIcon from '@/assets/emoji/angry-svgrepo-com.svg';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const ICON_SIZE = 14;

const getReactionIcon = (reactionType?: ReactionType | string) => {
  switch (reactionType) {
    case ReactionType.LIKE:
      return <ThumbsUpFillIcon width={ICON_SIZE} height={ICON_SIZE} />;
    case ReactionType.LOVE:
      return <HeartIcon width={ICON_SIZE} height={ICON_SIZE} />;
    case ReactionType.HAHA:
      return <HappySmileIcon width={ICON_SIZE} height={ICON_SIZE} />;
    case ReactionType.WOW:
      return <WowIcon width={ICON_SIZE} height={ICON_SIZE} />;
    case ReactionType.SAD:
      return <SadTearIcon width={ICON_SIZE} height={ICON_SIZE} />;
    case ReactionType.ANGRY:
      return <AngryIcon width={ICON_SIZE} height={ICON_SIZE} />;
    default:
      return <ThumbsUpFillIcon width={ICON_SIZE} height={ICON_SIZE} />;
  }
};

const getReactionColor = (reactionType?: ReactionType | string) => {
  switch (reactionType) {
    case ReactionType.LIKE:
      return 'bg-blue-500';
    case ReactionType.LOVE:
      return 'bg-rose-500';
    case ReactionType.HAHA:
    case ReactionType.WOW:
      return 'bg-yellow-500';
    case ReactionType.SAD:
      return 'bg-yellow-600';
    case ReactionType.ANGRY:
      return 'bg-orange-500';
    default:
      return 'bg-rose-400';
  }
};

const getReactionText = (
  reactionType?: ReactionType | string,
  target: 'post' | 'comment' = 'post'
) => {
  const targetText = target === 'post' ? 'bài viết' : 'bình luận';
  switch (reactionType) {
    case ReactionType.LIKE:
      return `Đã thích ${targetText} của bạn`;
    case ReactionType.LOVE:
      return `Đã yêu thích ${targetText} của bạn`;
    case ReactionType.HAHA:
      return `Đã cười với ${targetText} của bạn`;
    case ReactionType.WOW:
      return `Đã ngạc nhiên với ${targetText} của bạn`;
    case ReactionType.SAD:
      return `Đã buồn về ${targetText} của bạn`;
    case ReactionType.ANGRY:
      return `Đã phẫn nộ với ${targetText} của bạn`;
    default:
      return `Đã bày tỏ cảm xúc với ${targetText} của bạn`;
  }
};

const getNotificationIcon = (notification: Notification) => {
  const { type, metadata } = notification;
  switch (type) {
    case NotificationType.FRIEND_REQUEST_SENT:
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return <UserPlus className="h-3 w-3 text-white" />;
    case NotificationType.POST_REACTED:
    case NotificationType.COMMENT_REACTED:
      return getReactionIcon(metadata?.reactionType);
    case NotificationType.POST_COMMENTED:
      return <MessageCircle className="h-3 w-3 text-white" />;
    case NotificationType.COMMENT_REPLY_CREATED:
      return <Reply className="h-3 w-3 text-white" />;
    default:
      return <Bell className="h-3 w-3 text-white" />;
  }
};

const getNotificationColor = (notification: Notification) => {
  const { type, metadata } = notification;
  switch (type) {
    case NotificationType.FRIEND_REQUEST_SENT:
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return 'bg-blue-400';
    case NotificationType.POST_REACTED:
    case NotificationType.COMMENT_REACTED:
      return getReactionColor(metadata?.reactionType);
    case NotificationType.POST_COMMENTED:
    case NotificationType.COMMENT_REPLY_CREATED:
      return 'bg-green-400';
    default:
      return 'bg-primary';
  }
};

const getNotificationText = (notification: Notification) => {
  const { type, metadata } = notification;
  switch (type) {
    case NotificationType.FRIEND_REQUEST_SENT:
      return 'Đã gửi cho bạn một lời mời kết bạn';
    case NotificationType.FRIEND_REQUEST_ACCEPTED:
      return 'Đã chấp nhận lời mời kết bạn của bạn';
    case NotificationType.POST_REACTED:
      return getReactionText(metadata?.reactionType, 'post');
    case NotificationType.POST_COMMENTED:
      return 'Đã bình luận bài viết của bạn';
    case NotificationType.COMMENT_REACTED:
      return getReactionText(metadata?.reactionType, 'comment');
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
            getNotificationColor(notification)
          )}
        >
          {getNotificationIcon(notification)}
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-sm leading-snug">
          <span className="font-semibold text-foreground mr-1">
            {notification.sender.lastName} {notification.sender.firstName}
          </span>
          <span className="text-muted-foreground">
            {getNotificationText(notification)}
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
