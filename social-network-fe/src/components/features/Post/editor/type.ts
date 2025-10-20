import { Post } from '@/lib/dtos';
import {
  MediaItemWithHandlingStatus,
  UIMediaItem,
} from '../../common/MediaComponent/type';

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
      media: UIMediaItem[],
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
