import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useStore } from '@/store';

export const authKeys = {
  all: ['auth'] as const,
  verifyUser: () => [...authKeys.all, 'me'] as const,
};
export const useLogout = () => {
  const clearUser = useStore((state) => state.clearUser);
  const clearCrypto = useStore((state) => state.clearCrypto);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearUser();
      clearCrypto();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
};
