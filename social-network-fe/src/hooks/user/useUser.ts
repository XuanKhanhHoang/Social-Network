import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { userService } from '@/services/user';
import {
  transformAndGetUserProfile,
  transformToUserAccount,
  transformToUserHeader,
} from '@/lib/interfaces/user';
import {
  GetUserHeaderResponseDto,
  GetUserProfileResponseDto,
  UpdateAccountRequestDto,
  UpdateAccountResponseDto,
  UpdateProfileRequestDto,
  UpdateProfileResponseDto,
} from '@/lib/dtos';

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  headers: () => [...userKeys.all, 'header'] as const,
  header: (username: string) => [...userKeys.headers(), username] as const,
  profiles: () => [...userKeys.all, 'profile'] as const,
  profile: (username: string) => [...userKeys.profiles(), username] as const,
  friends: () => [...userKeys.all, 'friends'] as const,
  friend: (username: string) => [...userKeys.friends(), username] as const,
  photos: () => [...userKeys.all, 'photos'] as const,
  photo: (username: string) => [...userKeys.photos(), username] as const,
  account: () => [...userKeys.all, 'account'] as const,
};

export const useUserHeader = (username: string) => {
  return useQuery({
    queryKey: userKeys.header(username),
    queryFn: () => userService.getHeader(username),
    select: (res) => transformToUserHeader(res),
    enabled: !!username,
  });
};

export const useUserProfile = (username: string) => {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => userService.getProfile(username),
    select: (res) => transformAndGetUserProfile(res),
    enabled: !!username,
  });
};

export const useUserPhotosPreview = (username: string) => {
  return useInfiniteQuery({
    queryKey: userKeys.photo(username),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      userService.getPhotosPreview(username, pageParam as string | undefined),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextCursor ?? undefined;
    },
    initialPageParam: undefined,
    enabled: !!username,
  });
};
export const useUserFriendsPreview = (username: string) => {
  return useInfiniteQuery({
    queryKey: userKeys.friend(username),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      userService.getFriendsPreview(username, pageParam as string | undefined),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextCursor ?? undefined;
    },
    initialPageParam: undefined,
    enabled: !!username,
  });
};

export const useGetAccount = () => {
  return useQuery({
    queryKey: userKeys.account(),
    queryFn: () => userService.getAccount(),
    select: (r) => transformToUserAccount(r),
  });
};
export const useUpdateAccount = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAccountRequestDto) =>
      userService.updateAccount(data),
    onSuccess: (data: UpdateAccountResponseDto) => {
      queryClient.setQueryData(
        userKeys.account(),
        transformToUserAccount(data)
      );
      queryClient.setQueryData(
        userKeys.header(username),
        (oldData: GetUserHeaderResponseDto) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            firstName: data.firstName,
            lastName: data.lastName,
          } as GetUserHeaderResponseDto;
        }
      );
      queryClient.setQueryData(
        userKeys.profile(username),
        (oldData: GetUserProfileResponseDto) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            firstName: data.firstName,
            lastName: data.lastName,
          } as GetUserProfileResponseDto;
        }
      );
    },
  });
};
export const useUpdateUserProfile = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequestDto) =>
      userService.updateUserProfile(username, data),
    onSuccess: (data: UpdateProfileResponseDto) => {
      const { _id, avatar, coverPhoto, bio, work, currentLocation, username } =
        data;
      queryClient.setQueryData(
        userKeys.header(username),
        (oldData: GetUserHeaderResponseDto) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            avatar,
            coverPhoto,
            bio,
            work,
            currentLocation,
          } as GetUserHeaderResponseDto;
        }
      );
      queryClient.setQueryData(
        userKeys.profile(username),
        (oldData: GetUserProfileResponseDto) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            avatar,
            coverPhoto,
            bio,
            work,
            currentLocation,
          } as GetUserProfileResponseDto;
        }
      );
    },
  });
};
