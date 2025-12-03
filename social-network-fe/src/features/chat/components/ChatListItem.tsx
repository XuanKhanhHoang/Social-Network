import { useChatContext } from '@/features/chat/context/ChatContext';
import { SearchConversation } from '@/features/chat/types/chat';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatDisplayTime } from '@/lib/utils/time';

interface ChatListItemProps {
  conversation: SearchConversation;
  onClick?: () => void;
}

export const ChatListItem = ({ conversation, onClick }: ChatListItemProps) => {
  const { openSession } = useChatContext();
  const user = useStore((state) => state.user);

  if (!user) return null;

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== user.id
  );

  if (!otherParticipant) return null;

  const lastMessage = conversation.lastMessage;
  const isUnread = !conversation.hasRead;

  const handleClick = () => {
    openSession({
      type: 'private',
      data: {
        _id: otherParticipant.id,
        firstName: otherParticipant.firstName,
        lastName: otherParticipant.lastName,
        username: otherParticipant.username,
        avatar: otherParticipant.avatar
          ? {
              url: otherParticipant.avatar.url,
              width: otherParticipant.avatar.width,
              height: otherParticipant.avatar.height,
              mediaId: otherParticipant.avatar.mediaId,
            }
          : undefined,
      },
    });
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg',
        isUnread && 'bg-accent/20'
      )}
    >
      <div className="relative">
        <UserAvatar
          src={otherParticipant.avatar?.url}
          name={otherParticipant.firstName}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <span className={cn('font-medium truncate', isUnread && 'font-bold')}>
            {otherParticipant.lastName} {otherParticipant.firstName}
          </span>
          {conversation.lastInteractiveAt && (
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatDisplayTime(conversation.lastInteractiveAt)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p
            className={cn(
              'text-sm truncate max-w-[180px]',
              isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            {lastMessage
              ? lastMessage.sender.id == user.id
                ? lastMessage.isRecovered
                  ? 'Bạn: Tin nhắn đã bị thu hồi'
                  : lastMessage.type == 'text'
                  ? 'Bạn: Tin nhắn văn bản'
                  : 'Bạn: Hình ảnh'
                : lastMessage.isRecovered
                ? `${otherParticipant.firstName}: Tin nhắn đã bị thu hồi`
                : lastMessage.type == 'text'
                ? `${otherParticipant.firstName}: Tin nhắn văn bản`
                : `${otherParticipant.firstName}: Hình ảnh`
              : 'Bắt đầu cuộc trò chuyện'}
          </p>
          {isUnread && (
            <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 ml-2" />
          )}
        </div>
      </div>
    </div>
  );
};
