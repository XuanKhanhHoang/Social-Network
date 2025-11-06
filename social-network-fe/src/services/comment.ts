import {
  CreateCommentRequestDto,
  GetCommentsResponseDto,
  UpdateCommentRequestDto,
} from '@/lib/dtos';
import { ApiClient } from './api';
import { RequestOptions } from './type';

const COMMENT_PREFIX = '/comments';

export const commentService = {
  async createComment(
    data: CreateCommentRequestDto
  ): Promise<{ _id: string } & unknown> {
    return ApiClient.post<{ _id: string } & unknown>(COMMENT_PREFIX, data);
  },

  async updateComment(
    id: string,
    data: UpdateCommentRequestDto
  ): Promise<{ _id: string } & unknown> {
    return ApiClient.patch<{ _id: string } & unknown>(
      `${COMMENT_PREFIX}/${id}`,
      data
    );
  },

  async getPostComments({
    postId,
    cursor,
    limit,
    options,
  }: {
    postId: string;
    cursor?: string;
    limit?: number;
    options?: RequestOptions;
  }): Promise<GetCommentsResponseDto> {
    const queries = new URLSearchParams();
    queries.set('postId', postId);
    if (cursor) queries.set('cursor', cursor);
    if (limit) queries.set('limit', limit.toString());

    return ApiClient.get(`${COMMENT_PREFIX}?${queries.toString()}`, options);
  },

  async getCommentReplies({
    commentId,
    cursor,
    limit,
    options,
  }: {
    commentId: string;
    cursor?: string;
    limit?: number;
    options?: RequestOptions;
  }): Promise<GetCommentsResponseDto> {
    const queries = new URLSearchParams();
    if (cursor) queries.set('cursor', cursor);
    if (limit) queries.set('limit', limit.toString());

    const queryString = queries.toString();
    const url = `${COMMENT_PREFIX}/${commentId}/replies${
      queryString ? `?${queryString}` : ''
    }`;

    return ApiClient.get(url, options);
  },
  async deleteComment(commentId: string) {
    return ApiClient.delete(`${COMMENT_PREFIX}/${commentId}`);
  },
};
