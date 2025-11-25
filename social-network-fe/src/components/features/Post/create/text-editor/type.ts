import { PostMediaDto } from '@/lib/dtos';
import { JSONContent } from '@tiptap/react';

export function transformToPostInEditor(
  post: unknown & {
    content: JSONContent;
    media?: PostMediaDto[];
    backgroundValue?: string;
    _id: string;
  }
): PostInEditor {
  return {
    id: post._id,
    content: post.content,
    backgroundValue: post.backgroundValue,
    media: post.media,
  };
}

export type PostInEditor = {
  id: string;
  content: JSONContent;
  backgroundValue?: string;
  media?: PostMediaDto[];
};
