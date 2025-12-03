import { mapPostMediaDtoToPostMedia } from '@/features/post/utils/mapper';
import { PostMediaDto } from '@/lib/dtos';
import { VisibilityPrivacy } from '@/lib/constants/enums/visibility-privacy';
import { Post } from '@/lib/interfaces';
import { JSONContent } from '@tiptap/react';

export function transformToPostInEditor(post: Post): PostInEditor {
  return {
    id: post.id,
    content: post.content,
    backgroundValue: post.backgroundValue,
    media: post.media?.map(mapPostMediaDtoToPostMedia),
    visibility: post.visibility,
  };
}

export type PostInEditor = {
  id: string;
  content: JSONContent;
  backgroundValue?: string;
  media?: PostMediaDto[];
  visibility?: VisibilityPrivacy;
};
