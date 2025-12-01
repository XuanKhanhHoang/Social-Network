import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { chatKeys } from './useChat';

export const useConversationId = (userId: string | undefined) => {
  return useQuery({
    queryKey: [...chatKeys.all, 'conversation-id', userId],
    queryFn: async () => {
      if (!userId) return null;
      const conversation = await chatService.getConversationByUserId(userId);
      return conversation._id;
    },
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
