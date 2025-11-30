export interface SuggestedMessagingUserDto {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: {
    url: string;
    type: string;
  };
  isOnline: boolean;
  lastInteractiveAt: string;
  score: number;
}

export interface SuggestedMessagingUsersResponseDto {
  data: SuggestedMessagingUserDto[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
  };
}
