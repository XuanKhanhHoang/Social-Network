'use client';

import { ReactionTargetType, ReactionType } from '@/lib/constants/enums';
import ReactionButton from '../ui/reaction-button';
import { useUpdateCommentCache } from '@/features/comment/hooks/useCommentCache';
import { CommentWithMyReaction } from '@/lib/interfaces/comment';
type CommentReactionButtonProps = Omit<
  React.ComponentProps<typeof ReactionButton>,
  | 'entityId'
  | 'entityType'
  | 'initialReaction'
  | 'initialCount'
  | 'onReactionChange'
> & {
  comment: CommentWithMyReaction;
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
    updateUserReaction(comment.id, newReaction, oldReaction);
  };

  return (
    <ReactionButton
      {...props}
      entityId={comment.id}
      entityType={ReactionTargetType.COMMENT}
      initialReaction={comment.myReaction}
      initialCount={comment.reactionsCount}
      onReactionChange={handleReactionChange}
    />
  );
}
