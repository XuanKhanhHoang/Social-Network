import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '../services/user.service';
import { GetUsersParams, UpdateUserDto } from '../services/user.dto';

export const useAdminUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminUserService.getUsers(params),
  });
};

export const useUserDetail = (userId: string | null) => {
  return useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => adminUserService.getUserDetail(userId!),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserDto }) =>
      adminUserService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
  });
};

export const useLockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUserService.lockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUserService.restoreUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
  });
};
