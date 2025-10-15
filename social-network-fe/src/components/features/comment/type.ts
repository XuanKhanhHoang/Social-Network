import { Comment } from '@/types-define/dtos';

export type CommentItemProps = {
  comment: Comment;
  showReactionButton?: boolean;
  showReply?: boolean;
  className?: string;
};
