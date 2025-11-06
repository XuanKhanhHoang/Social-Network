import {
  CreatePostRequestDto,
  CreatePostResponseDto,
  GetPostsFeedResponseDto,
  PostWithMyReactionDto,
  UpdatePostRequestDto,
  UpdatePostResponseDto,
} from '@/lib/dtos';
import { ApiClient } from './api';
import { RequestOptions } from './type';

const POST_PREFIX = '/posts';

export const postService = {
  async createPost(data: CreatePostRequestDto): Promise<CreatePostResponseDto> {
    return ApiClient.post(`${POST_PREFIX}`, data);
  },
  async updatePost(
    id: string,
    data: UpdatePostRequestDto
  ): Promise<UpdatePostResponseDto> {
    return ApiClient.patch(`${POST_PREFIX}/${id}`, data);
  },
  async getPostsByCursor({
    cursor,
    limit,
    options,
  }: {
    cursor?: string;
    limit?: number;
    options?: RequestOptions;
  }): Promise<GetPostsFeedResponseDto> {
    const queries = new URLSearchParams();
    if (cursor) queries.set('cursor', cursor);
    if (limit) queries.set('limit', limit.toString());

    const queryString = queries.toString();
    return ApiClient.get(
      `${POST_PREFIX}/gets${queryString ? `?${queryString}` : ''}`,
      options
    );
  },
  async getPost(
    postId: string,
    options?: RequestOptions
  ): Promise<PostWithMyReactionDto> {
    return ApiClient.get(`${POST_PREFIX}/${postId}`, options);
  },
};
