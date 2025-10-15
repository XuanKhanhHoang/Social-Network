import { Post } from '@/types-define/dtos';
import { MediaItem, MediaItemWithHandlingStatus } from '@/types-define/types';

export type PostInEditor = Omit<
  Post,
  | 'author'
  | 'reactionsCount'
  | 'commentsCount'
  | 'sharesCount'
  | 'userReactionType'
  | 'reactionsBreakdown'
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'tags'
  | 'userComments'
>;

export type PostEditorMediaProps = {
  media: MediaItemWithHandlingStatus[];
  handle: {
    onChange: (
      media: MediaItem[],
      captions: { [index: number]: string }
    ) => void;
    handleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRetryUpload: (index: number) => void;
    onRetryConfirm: (index: number) => void;
  };
  captions: Record<number, string>;
};

export type PostEditorProps = {
  handleClose: () => void;
  mode?: 'create' | 'edit';
  post?: PostInEditor;
};
