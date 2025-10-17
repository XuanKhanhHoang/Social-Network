'use client';

import { ReactionType } from '@/lib/constants/enums';
import ReactionButton from '../ui/reaction-button';
import { useUpdatePostCache } from '@/hooks/post/usePostCache';
type PostReactionButtonProps = Omit<
  React.ComponentProps<typeof ReactionButton>,
  'onReactionChange' | 'entityType' | 'entityId'
> & {
  postId: string;
};

export function PostReactionButton({
  postId,
  ...props
}: PostReactionButtonProps) {
  const { updateUserReaction } = useUpdatePostCache();

  const handleReactionChange = (
    newReaction: ReactionType | null,
    oldReaction: ReactionType | null
  ) => {
    updateUserReaction(postId, newReaction, oldReaction);
  };

  return (
    <ReactionButton
      {...props}
      entityId={postId}
      onReactionChange={handleReactionChange}
    />
  );
}
