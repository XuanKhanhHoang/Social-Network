import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user';
import { QUERY_KEY } from '@/lib/constants/query-key';
import {
  transformAndGetUserProfile,
  transformToUserBio,
  transformToUserHeader,
} from '@/lib/interfaces/user';

export const userKeys = {
  all: [QUERY_KEY.USER] as const,
  me: () => [...userKeys.all, 'me'] as const,
  headers: () => [...userKeys.all, 'header'] as const,
  header: (username: string) => [...userKeys.headers(), username] as const,
  profiles: () => [...userKeys.all, 'profile'] as const,
  profile: (username: string) => [...userKeys.profiles(), username] as const,
  bios: () => [...userKeys.all, 'bio'] as const,
  bio: (username: string) => [...userKeys.bios(), username] as const,
  friends: () => [...userKeys.all, 'friends'] as const,
  friend: (username: string) => [...userKeys.friends(), username] as const,
  photos: () => [...userKeys.all, 'photos'] as const,
  photo: (username: string) => [...userKeys.photos(), username] as const,
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

export const useUserBio = (username: string) => {
  return useQuery({
    queryKey: userKeys.bio(username),
    queryFn: () => userService.getBio(username),
    select: (res) => transformToUserBio(res),
    enabled: !!username,
  });
};

export const useUserFriendsPreview = (username: string) => {
  return useInfiniteQuery({
    queryKey: userKeys.friend(username),
    queryFn: ({ pageParam = 1 }) =>
      userService.getFriendsPreview(username, pageParam),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.pagination.hasNextPage ? lastPageParam + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!username,
  });
};

export const useUserPhotosPreview = (username: string) => {
  return useInfiniteQuery({
    queryKey: userKeys.photo(username),
    queryFn: ({ pageParam = 1 }) =>
      userService.getPhotosPreview(username, pageParam),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.pagination.hasNextPage ? lastPageParam + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!username,
  });
};
