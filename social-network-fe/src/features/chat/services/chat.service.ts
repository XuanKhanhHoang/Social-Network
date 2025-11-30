import { ApiClient } from '@/services/api';
import { SuggestedMessagingUsersResponseDto } from '../types/chat.dto';

const CHAT_PREFIX = '/chat';

export const chatService = {
  async getSuggestedMessagingUsers(
    params: { limit?: number; cursor?: string } = {}
  ): Promise<SuggestedMessagingUsersResponseDto> {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.cursor) query.append('cursor', params.cursor);

    const dto = await ApiClient.get<SuggestedMessagingUsersResponseDto>(
      `${CHAT_PREFIX}/suggested?${query.toString()}`
    );

    return dto;
  },
};
