import {
  CreatePostRequestDto,
  CreatePostResponseDto,
  PostWithMyReactionDto,
  UpdatePostRequestDto,
  UpdatePostResponseDto,
} from './post.dto';
import { ApiClient } from '@/services/api';
import { RequestOptions } from '@/services/type';

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

  async getPost(
    postId: string,
    options?: RequestOptions
  ): Promise<PostWithMyReactionDto> {
    return ApiClient.get(`${POST_PREFIX}/${postId}`, options);
  },

  async deletePost(postId: string): Promise<void> {
    return ApiClient.delete(`${POST_PREFIX}/${postId}`);
  },
};
