import { ApiClient } from '@/services/api';
import {
  GetAdminPostsParams,
  GetAdminPostsResponse,
  DeletePostResponse,
  RestorePostResponse,
} from './post.dto';

const ADMIN_POSTS_PREFIX = '/admin/posts';

export const adminPostService = {
  async getPosts(params?: GetAdminPostsParams): Promise<GetAdminPostsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.searchId) queryParams.set('searchId', params.searchId);
    if (params?.includeDeleted)
      queryParams.set('includeDeleted', params.includeDeleted.toString());

    const query = queryParams.toString();
    return ApiClient.get(`${ADMIN_POSTS_PREFIX}${query ? `?${query}` : ''}`);
  },

  async deletePost(postId: string): Promise<DeletePostResponse> {
    return ApiClient.delete(`${ADMIN_POSTS_PREFIX}/${postId}`);
  },

  async restorePost(postId: string): Promise<RestorePostResponse> {
    return ApiClient.post(`${ADMIN_POSTS_PREFIX}/${postId}/restore`, {});
  },
};
