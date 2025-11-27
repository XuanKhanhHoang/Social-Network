import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useStore } from '@/store';
import { useEffect } from 'react';
import { transformToStoreUser } from '@/store/slices/authSlice';

export const authKeys = {
  all: ['auth'] as const,
  verifyUser: () => [...authKeys.all, 'me'] as const,
};
export const useLogout = () => {
  const clearUser = useStore((state) => state.clearUser);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearUser();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      clearUser();
    },
  });
};
export const useVerifyUser = () => {
  const { user, setUser, clearUser } = useStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: authKeys.verifyUser(),
    queryFn: () => authService.verifyUser(),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setUser(transformToStoreUser(data));
    } else if (isError) {
      clearUser();
    }
  }, [data, isError, setUser, clearUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!data && !isError,
  };
};
