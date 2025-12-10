'use client';
import {
  useUserFriendsPreview,
  useUserPhotosPreview,
} from '@/features/user/hooks/useUser';
import {
  transformToUserPreviewPhoto,
  transformToUserSummary,
  UserProfile,
} from '@/features/user/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BioCard } from './UserBio';
import { PhotosCard } from '../cards/PhotoCard';
import { FriendsCard } from '../cards/FriendCard';
import { ViewAsTypeFriendshipStatus } from '../profile/header/ProfileActions';
import { Ban } from 'lucide-react';

interface UserSidebarProps {
  user: UserProfile;
  viewAsType: ViewAsTypeFriendshipStatus;
}

export default function UserSidebar({ user, viewAsType }: UserSidebarProps) {
  const isBlocked = viewAsType === 'BLOCKED';

  const { data: friendsPreview, isLoading: isLoadingFriends } =
    useUserFriendsPreview(user.username);
  const { data: photosPreview, isLoading: isLoadingPhotos } =
    useUserPhotosPreview(user.username);

  if (isBlocked) {
    return (
      <>
        <BioCard user={user} />
        <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
          <Ban className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Bạn đã chặn người dùng này</p>
        </div>
      </>
    );
  }

  if (isLoadingFriends || isLoadingPhotos) {
    return (
      <>
        <BioCard user={user} />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </>
    );
  }

  const photos =
    photosPreview?.pages
      .flatMap((page) => page.data)
      ?.map((i) => transformToUserPreviewPhoto(i)) ?? [];

  const friends =
    friendsPreview?.pages
      .flatMap((page) => page.data)
      .map((i) => transformToUserSummary(i)) ?? [];

  const hasFriends = friends.length > 0 || (user.friendCount ?? 0) > 0;

  return (
    <>
      <BioCard user={user} />
      <PhotosCard photos={photos} username={user.username} />
      {hasFriends && (
        <FriendsCard
          friends={friends}
          friendCount={user.friendCount || 0}
          username={user.username}
        />
      )}
    </>
  );
}
