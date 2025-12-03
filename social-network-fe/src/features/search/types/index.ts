import { PostWithTopCommentDto } from '@/features/post/services/post.dto';
import { UserSummaryWithAvatarUrlDto } from '@/lib/dtos';

import { FriendshipStatus } from '@/lib/constants/enums/friendship-status';

export interface SearchUserDto extends UserSummaryWithAvatarUrlDto {
  friendshipStatus: FriendshipStatus | 'NONE';
  isRequester?: boolean;
}

export interface SearchUserResponseDto {
  data: SearchUserDto[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface SearchPostResponseDto {
  data: PostWithTopCommentDto[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export type SearchTab = 'all' | 'people' | 'posts';
