import { useQuery } from '@tanstack/react-query';
import { chatKeys } from './useChat';
import { chatService } from '../services/chat.service';

export function useUnreadStatus() {
  return useQuery({
    queryKey: chatKeys.unreadStatus(),
    queryFn: () => chatService.checkUnreadStatus(),
    staleTime: Infinity,
    select: (data) => data.hasUnread,
  });
}
