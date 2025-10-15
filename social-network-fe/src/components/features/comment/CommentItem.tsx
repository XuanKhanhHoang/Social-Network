import MediaComponent from '../common/MediaComponent/MediaComponent';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import ReactionButton from '@/components/ui/reaction-button';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils/time';
import { CommentItemProps } from './type';
import { ReactionTargetType } from '@/lib/constants/enums';

export default function CommentItem({
  comment,
  showReactionButton = false,
  showReply = false,
  className,
}: CommentItemProps) {
  return (
    <div className="">
      <div className={`flex gap-3 items-start ${className}`}>
        <Avatar className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>
            {comment.author.firstName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="text-sm text-gray-800">
            <span className="font-semibold mr-2">
              {comment.author.firstName}
            </span>
            {comment?.content && (
              <span
                dangerouslySetInnerHTML={{
                  __html: generateHTML(comment?.content, [StarterKit, Emoji]),
                }}
              />
            )}
            {showReactionButton && (
              <ReactionButton
                entityId={comment._id}
                entityType={ReactionTargetType.COMMENT}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-500">
              {timeAgo(comment.createdAt)}
            </span>
            {Boolean(comment.reactionsCount && comment.reactionsCount > 0) && (
              <span className="text-xs text-gray-500 font-bold">
                {comment.reactionsCount} lượt thích
              </span>
            )}
            <Button
              variant="ghost"
              className="h-auto p-0 text-xs text-gray-500 font-semibold"
            >
              Reply
            </Button>
          </div>

          {comment.media && (
            <div className="mt-2">
              <MediaComponent
                item={comment?.media}
                justShow
                className={{
                  container: 'w-40 h-40',
                  media: 'rounded-lg object-cover',
                }}
              />
            </div>
          )}
        </div>
        <ReactionButton
          entityId={comment._id}
          showLabel={false}
          showCount={false}
          entityType={ReactionTargetType.COMMENT}
          initialCount={comment.reactionsCount}
          initialReaction={comment.userReactionType}
          btnClassName="px-2 py-1"
        />
      </div>
    </div>
  );
}
