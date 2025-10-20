'use client';

import { ReactionTargetType, ReactionType } from '@/lib/constants/enums';
import ReactionButton from '../ui/reaction-button';
import { Comment } from '@/lib/dtos';
import { useUpdateCommentCache } from '@/hooks/comment/useCommentCache';
type CommentReactionButtonProps = Omit<
  React.ComponentProps<typeof ReactionButton>,
  | 'entityId'
  | 'entityType'
  | 'initialReaction'
  | 'initialCount'
  | 'onReactionChange'
> & {
  comment: Comment;
};

export function CommentReactionButton({
  comment,
  ...props
}: CommentReactionButtonProps) {
  const { updateUserReaction } = useUpdateCommentCache();

  const handleReactionChange = (
    newReaction: ReactionType | null,
    oldReaction?: ReactionType | null
  ) => {
    updateUserReaction(comment._id, newReaction, oldReaction);
  };

  return (
    <ReactionButton
      {...props}
      entityId={comment._id}
      entityType={ReactionTargetType.COMMENT}
      initialReaction={comment.myReaction}
      initialCount={comment.reactionsCount}
      onReactionChange={handleReactionChange}
    />
  );
}
