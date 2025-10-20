import { Comment } from '@/lib/dtos';
import { MediaItemWithHandlingStatus } from '../common/MediaComponent/type';
import { JSONContent } from '@tiptap/react';

export type CommentItemProps = {
  comment: Comment;
  showReactionButton?: boolean;
  showReply?: boolean;
  className?: string;
};
export type CommentEditorProps = {
  postId: string;
  parentId?: string;
  data?: {
    content?: JSONContent;
    media?: MediaItemWithHandlingStatus;
    _id: string;
  };
  className?: string;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  allowMedia?: boolean;
  variant?: 'minimal' | 'boxed';
};
