import { CreatePostDto, Post, PostListResponse } from '@/lib/dtos';
import { ApiClient } from './api';
import { RequestOptions } from './type';

export const postService = {
  async createPost(data: CreatePostDto): Promise<unknown> {
    return ApiClient.post<unknown>('/post/create', data);
  },
  async updatePost(id: string, data: CreatePostDto): Promise<unknown> {
    return ApiClient.patch<unknown>(`/post/update/${id}`, data);
  },
  async getPostsByCursor({
    cursor,
    limit,
    options,
  }: {
    cursor?: string;
    limit?: number;
    options?: RequestOptions;
  }): Promise<PostListResponse> {
    const queries = new URLSearchParams();
    if (cursor) queries.set('cursor', cursor);
    if (limit) queries.set('limit', limit.toString());
    return ApiClient.get(`/post/gets?${queries.toString()}`, options);
  },
  async getPost(postId: string, options?: RequestOptions): Promise<Post> {
    return ApiClient.get('/post/' + postId, options);
  },
};
