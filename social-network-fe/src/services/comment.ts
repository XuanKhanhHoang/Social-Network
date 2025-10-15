import { CreateCommentDto, Post, UpdateCommentDto } from '@/types-define/dtos';
import { ApiClient } from './api';

export const commentService = {
  async createComment(
    data: CreateCommentDto
  ): Promise<{ _id: string } & unknown> {
    return ApiClient.post<{ _id: string } & unknown>('/comment/create', data);
  },
  async updateComment(
    id: string,
    data: UpdateCommentDto
  ): Promise<{ _id: string } & unknown> {
    return ApiClient.patch<{ _id: string } & unknown>(
      `/comment/update/${id}`,
      data
    );
  },
  async getComment(page = 1): Promise<{
    posts: Post[];
    total: number;
  }> {
    return ApiClient.get('/post/gets?page=' + page);
  },
};
