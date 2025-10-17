import {
  CreateCommentDto,
  GetCommentListResponse,
  UpdateCommentDto,
} from '@/types-define/dtos';
import { ApiClient } from './api';
import { RequestOptions } from '@/types-define/types';

export const commentService = {
  async createComment(
    data: CreateCommentDto
  ): Promise<{ _id: string } & unknown> {
    return ApiClient.post<{ _id: string } & unknown>('/comments', data);
  },

  async updateComment(
    id: string,
    data: UpdateCommentDto
  ): Promise<{ _id: string } & unknown> {
    return ApiClient.patch<{ _id: string } & unknown>(`/comments/${id}`, data);
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
  }): Promise<GetCommentListResponse> {
    const queries = new URLSearchParams();
    queries.set('postId', postId);
    if (cursor) queries.set('cursor', cursor);
    if (limit) queries.set('limit', limit.toString());

    return ApiClient.get(`/comments?${queries.toString()}`, options);
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
  }): Promise<GetCommentListResponse> {
    const queries = new URLSearchParams();
    if (cursor) queries.set('cursor', cursor);
    if (limit) queries.set('limit', limit.toString());

    const url = `/comments/${commentId}/replies?${queries.toString()}`;

    return ApiClient.get(url, options);
  },
  async deleteComment(commentId: string) {
    return ApiClient.delete(`/comments/${commentId}`);
  },
};
