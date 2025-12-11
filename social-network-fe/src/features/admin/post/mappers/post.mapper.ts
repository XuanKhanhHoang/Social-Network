import { JSONContent } from '@tiptap/react';
import {
  AdminPostDto,
  GetAdminPostsResponse,
  DeletePostResponse,
  RestorePostResponse,
} from '../services/post.dto';
import {
  AdminPost,
  AdminPostsResult,
  DeletePostResult,
  RestorePostResult,
  PostMedia,
  PostStatus,
} from '../types/post.types';

function mapPostAuthor(author: AdminPostDto['author']) {
  return {
    id: author._id,
    username: author.username,
    firstName: author.firstName,
    lastName: author.lastName,
    avatar: author.avatar,
  };
}

function extractMedia(
  media: { url: string; mediaType: string; caption?: string }[] | undefined
): PostMedia[] {
  if (!Array.isArray(media)) return [];

  return media.map((m) => ({
    url: m.url,
    mediaType: m.mediaType === 'video' ? 'video' : 'image',
    caption: m.caption,
  }));
}

function extractContent(content: Record<string, unknown>): JSONContent | null {
  if (!content || typeof content !== 'object') return null;
  if ('type' in content && content.type === 'doc') {
    return content as JSONContent;
  }
  return null;
}

export function mapAdminPost(dto: AdminPostDto): AdminPost {
  return {
    id: dto._id,
    author: mapPostAuthor(dto.author),
    content: extractContent(dto.content),
    plainText: dto.plain_text,
    media: extractMedia(dto.media),
    visibility: dto.visibility,
    status: dto.status as PostStatus,
    reactionsCount: dto.reactionsCount,
    commentsCount: dto.commentsCount,
    sharesCount: dto.sharesCount,
    createdAt: new Date(dto.createdAt),
    deletedAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
    pendingReportsCount: dto.pendingReportsCount,
  };
}

export function mapAdminPostsResponse(
  response: GetAdminPostsResponse
): AdminPostsResult {
  return {
    posts: response.data.map(mapAdminPost),
    pagination: response.pagination,
  };
}

export function mapDeletePostResponse(
  response: DeletePostResponse
): DeletePostResult {
  return {
    success: response.success,
    message: response.message,
    totalReportsResolved: response.totalReportsResolved,
  };
}

export function mapRestorePostResponse(
  response: RestorePostResponse
): RestorePostResult {
  return {
    success: response.success,
    message: response.message,
  };
}
