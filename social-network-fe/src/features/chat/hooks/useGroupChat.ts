'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { chatKeys } from './useChat';
import { GroupMember } from '../types/chat';
import { useMemo } from 'react';
import { useStore } from '@/store';
import { getSharedKey } from '@/features/crypto/utils/cryptions';

export const useGroupChat = (conversationId: string) => {
  const queryClient = useQueryClient();
  const secretKey = useStore((state) => state.mySecretKey);

  const membersQuery = useQuery({
    queryKey: chatKeys.groupMembers(conversationId),
    queryFn: () => chatService.getGroupMembers(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const members: GroupMember[] = useMemo(() => {
    if (!membersQuery.data) return [];
    return membersQuery.data.members.map((m) => ({
      id: m._id,
      firstName: m.firstName,
      lastName: m.lastName,
      username: m.username,
      avatar: m.avatar,
      publicKey: m.publicKey,
      joinedAt: m.joinedAt,
    }));
  }, [membersQuery.data]);

  const owner = membersQuery.data?.owner || membersQuery.data?.createdBy;
  const createdBy = membersQuery.data?.createdBy;

  const memberSharedKeys = useMemo(() => {
    if (!secretKey || !members.length) return [];
    return members.map((member) => ({
      id: member.id,
      sharedKey: getSharedKey(secretKey, member.publicKey),
    }));
  }, [secretKey, members]);

  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; memberIds: string[] }) => {
      return chatService.createGroup(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (data: { name?: string; avatar?: string }) => {
      return chatService.updateGroup(conversationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: async (memberIds: string[]) => {
      return chatService.addGroupMembers(conversationId, memberIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.groupMembers(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });

  const kickMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return chatService.kickGroupMember(conversationId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.groupMembers(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      return chatService.leaveGroup(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });

  const assignAdminMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return chatService.assignGroupAdmin(conversationId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.groupMembers(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      return chatService.deleteGroup(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });

  return {
    // Members
    members,
    owner,
    createdBy,
    memberSharedKeys,
    isMembersLoading: membersQuery.isLoading,
    refetchMembers: membersQuery.refetch,

    // Mutations
    createGroup: createGroupMutation.mutateAsync,
    updateGroup: updateGroupMutation.mutateAsync,
    addMembers: addMembersMutation.mutateAsync,
    kickMember: kickMemberMutation.mutateAsync,
    leaveGroup: leaveGroupMutation.mutateAsync,
    assignAdmin: assignAdminMutation.mutateAsync,
    deleteGroup: deleteGroupMutation.mutateAsync,

    // Loading states
    isCreating: createGroupMutation.isPending,
    isUpdating: updateGroupMutation.isPending,
    isAddingMembers: addMembersMutation.isPending,
    isKicking: kickMemberMutation.isPending,
    isLeaving: leaveGroupMutation.isPending,
    isAssigningAdmin: assignAdminMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,
  };
};
