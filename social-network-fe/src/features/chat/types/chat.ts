export interface SuggestedMessagingUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastInteractiveAt: Date;
  score: number;
}

export interface SuggestedMessagingUsersResponse {
  data: SuggestedMessagingUser[];
  nextCursor?: string;
}
