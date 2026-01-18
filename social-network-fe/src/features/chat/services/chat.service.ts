import { ApiClient } from '@/services/api';
import {
  ConversationResponseDto,
  ConversationsResponseDto,
  CreateGroupRequestDto,
  GroupConversationResponseDto,
  GroupMembersResponseDto,
  MessageResponseDto,
  MessagesResponseDto,
  SearchConversationsResponseDto,
  SendMessageRequestDto,
  SuggestedMessagingUsersResponseDto,
  UpdateGroupRequestDto,
} from './chat.dto';

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

  async searchMessagingUsers(params: {
    query: string;
    limit?: number;
    cursor?: string;
  }): Promise<SuggestedMessagingUsersResponseDto> {
    const query = new URLSearchParams();
    query.append('search', params.query);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.cursor) query.append('cursor', params.cursor);

    const dto = await ApiClient.get<SuggestedMessagingUsersResponseDto>(
      `${CHAT_PREFIX}/search-user?${query.toString()}`
    );

    return dto;
  },

  async getConversations(
    params: { limit?: number; cursor?: string } = {}
  ): Promise<ConversationsResponseDto> {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.cursor) query.append('cursor', params.cursor);

    return ApiClient.get<ConversationsResponseDto>(
      `${CHAT_PREFIX}/conversations?${query.toString()}`
    );
  },

  async searchConversations(params: {
    limit?: number;
    cursor?: string;
    search?: string;
  }): Promise<SearchConversationsResponseDto> {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.cursor) query.append('cursor', params.cursor);
    if (params.search) query.append('search', params.search);

    return ApiClient.get<SearchConversationsResponseDto>(
      `${CHAT_PREFIX}/conversations/search?${query.toString()}`
    );
  },

  async getMessages(
    conversationId: string,
    params: { limit?: number; cursor?: string } = {}
  ): Promise<MessagesResponseDto> {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.cursor) query.append('cursor', params.cursor);

    return ApiClient.get<MessagesResponseDto>(
      `${CHAT_PREFIX}/messages/${conversationId}?${query.toString()}`
    );
  },

  async sendMessage(data: SendMessageRequestDto): Promise<MessageResponseDto> {
    const formData = new FormData();

    if (data.receiverId) {
      formData.append('receiverId', data.receiverId);
    }
    if (data.conversationId) {
      formData.append('conversationId', data.conversationId);
    }

    formData.append('type', data.type);

    // 1-1 text content
    if (data.content) {
      formData.append('content', data.content);
      if (!data.nonce) throw new Error('nonce is required');
      formData.append('nonce', data.nonce);
    }

    // Group text content (multi-encrypt)
    if (data.encryptedContents) {
      formData.append(
        'encryptedContents',
        JSON.stringify(data.encryptedContents)
      );
      if (!data.nonce) throw new Error('nonce is required for group text');
      formData.append('nonce', data.nonce);
    }

    // Media file
    if (data.file) {
      formData.append('file', data.file);
      if (!data.mediaNonce) throw new Error('mediaNonce is required');
      formData.append('mediaNonce', data.mediaNonce);
    }

    if (data.encryptedFileKeys) {
      formData.append(
        'encryptedFileKeys',
        JSON.stringify(data.encryptedFileKeys)
      );
      if (!data.keyNonce)
        throw new Error('keyNonce is required for group media');
      formData.append('keyNonce', data.keyNonce);
    }

    return ApiClient.post<MessageResponseDto>(
      `${CHAT_PREFIX}/message`,
      formData
    );
  },

  async getConversationByUserId(
    userId: string
  ): Promise<ConversationResponseDto> {
    return ApiClient.get<ConversationResponseDto>(
      `${CHAT_PREFIX}/recipient/${userId}`
    );
  },

  async markAsRead(conversationId: string): Promise<void> {
    return ApiClient.post(
      `${CHAT_PREFIX}/conversations/${conversationId}/read`,
      {}
    );
  },

  async recallMessage(messageId: string): Promise<void> {
    return ApiClient.post(`${CHAT_PREFIX}/messages/${messageId}/recall`, {});
  },

  async checkUnreadStatus(): Promise<{ hasUnread: boolean }> {
    return ApiClient.get<{ hasUnread: boolean }>(
      `${CHAT_PREFIX}/unread-status`
    );
  },

  async createGroup(
    data: CreateGroupRequestDto
  ): Promise<GroupConversationResponseDto> {
    return ApiClient.post<GroupConversationResponseDto>(
      `${CHAT_PREFIX}/group`,
      data
    );
  },

  async updateGroup(
    groupId: string,
    data: UpdateGroupRequestDto
  ): Promise<GroupConversationResponseDto> {
    return ApiClient.patch<GroupConversationResponseDto>(
      `${CHAT_PREFIX}/group/${groupId}`,
      data
    );
  },

  async getGroupMembers(groupId: string): Promise<GroupMembersResponseDto> {
    return ApiClient.get<GroupMembersResponseDto>(
      `${CHAT_PREFIX}/group/${groupId}/members`
    );
  },

  async addGroupMembers(
    groupId: string,
    memberIds: string[]
  ): Promise<GroupConversationResponseDto> {
    return ApiClient.post<GroupConversationResponseDto>(
      `${CHAT_PREFIX}/group/${groupId}/members`,
      { memberIds }
    );
  },

  async kickGroupMember(
    groupId: string,
    memberId: string
  ): Promise<GroupConversationResponseDto> {
    return ApiClient.delete<GroupConversationResponseDto>(
      `${CHAT_PREFIX}/group/${groupId}/members/${memberId}`
    );
  },

  async leaveGroup(groupId: string): Promise<void> {
    return ApiClient.post(`${CHAT_PREFIX}/group/${groupId}/leave`, {});
  },

  async assignGroupAdmin(
    groupId: string,
    newAdminId: string
  ): Promise<GroupConversationResponseDto> {
    return ApiClient.patch(`${CHAT_PREFIX}/group/${groupId}/owner`, {
      newAdminId,
    });
  },

  async deleteGroup(groupId: string): Promise<void> {
    return ApiClient.delete(`${CHAT_PREFIX}/group/${groupId}`);
  },
};
