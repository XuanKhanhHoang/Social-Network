export const friendshipKeys = {
  all: ['friendships'] as const,
  requests: () => [...friendshipKeys.all, 'requests'] as const,
  received: () => [...friendshipKeys.requests(), 'received'] as const,
  sent: () => [...friendshipKeys.requests(), 'sent'] as const,
  friends: () => [...friendshipKeys.all, 'friends'] as const,
  friendList: (username?: string, search?: string) =>
    [...friendshipKeys.friends(), username, search] as const,
  suggested: () => [...friendshipKeys.all, 'suggested'] as const,
  blocked: () => [...friendshipKeys.all, 'blocked'] as const,
};
