import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user';

export const userKeys = {
  all: ['users'] as const,
  profiles: () => [...userKeys.all, 'profile'] as const,
  profile: (username: string) => [...userKeys.profiles(), username] as const,
};

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => userService.getProfile(username),
    enabled: !!username,
  });
}
