import {
  CreatePostDto,
  PostFullDetail,
  PostListResponse,
} from '@/types-define/dtos';
import { ApiClient } from './api';
import { RequestOptions } from '@/types-define/types';

export const postService = {
  async createPost(data: CreatePostDto): Promise<unknown> {
    return ApiClient.post<unknown>('/post/create', data);
  },
  async updatePost(id: string, data: CreatePostDto): Promise<unknown> {
    return ApiClient.patch<unknown>(`/post/update/${id}`, data);
  },
  async getPostsByPage(
    page = 1,
    options?: RequestOptions
  ): Promise<PostListResponse> {
    return ApiClient.get('/post/gets?page=' + page, options);
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
  async getPost(
    postId: string,
    options?: RequestOptions
  ): Promise<PostFullDetail> {
    return ApiClient.get('/post/' + postId, options);
  },
};
