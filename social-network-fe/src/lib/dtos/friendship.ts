import { FriendshipStatus } from '../constants/enums';
import { CursorPaginationResponse } from './common/pagination';
import { UserSummaryDto } from './user';

export interface SendFriendRequestDto {
  recipientId: string;
}

export interface AcceptFriendRequestDto {
  requesterId: string;
}

export interface FriendRequestDto {
  _id: string;
  requester: UserSummaryDto;
  recipient: UserSummaryDto;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export type GetReceivedFriendRequestsResponseDto =
  CursorPaginationResponse<FriendshipDto>;

export type GetSuggestedFriendsResponseDto =
  CursorPaginationResponse<UserSummaryDto>;

export type GetSentFriendRequestsResponseDto =
  CursorPaginationResponse<FriendshipDto>;

export interface FriendshipDto {
  _id: string;
  requester: UserSummaryDto;
  recipient: UserSummaryDto;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SendFriendRequestResponseDto {
  recipient: {
    _id: string;
    username: string;
  };
  requester: {
    _id: string;
  };
  status: FriendshipStatus;
}
export interface AcceptFriendRequestResponseDto {
  requester: {
    _id: string;
    username: string;
  };
  recipient: {
    _id: string;
    username: string;
  };
  status: FriendshipStatus;
}
export interface RemoveFriendResponseDto {
  requester: {
    _id: string;
    username: string;
  };
  recipient: {
    _id: string;
    username: string;
  };
}
