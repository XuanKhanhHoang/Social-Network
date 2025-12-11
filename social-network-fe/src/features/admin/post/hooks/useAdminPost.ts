import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPostService } from '../services/post.service';
import { GetAdminPostsParams } from '../services/post.dto';
import {
  mapAdminPostsResponse,
  mapDeletePostResponse,
  mapRestorePostResponse,
} from '../mappers/post.mapper';

export const useAdminPosts = (params?: GetAdminPostsParams) => {
  return useQuery({
    queryKey: ['admin-posts', params],
    queryFn: async () => {
      const response = await adminPostService.getPosts(params);
      return mapAdminPostsResponse(response);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await adminPostService.deletePost(postId);
      return mapDeletePostResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });
};

export const useRestorePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await adminPostService.restorePost(postId);
      return mapRestorePostResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });
};
