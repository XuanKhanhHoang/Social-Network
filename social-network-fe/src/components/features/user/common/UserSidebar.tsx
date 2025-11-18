'use client';
import {
  useUserFriendsPreview,
  useUserPhotosPreview,
} from '@/hooks/user/useUser';
import {
  transformToUserPreviewPhoto,
  transformToUserSummary,
  UserProfile,
} from '@/lib/interfaces/user';
import { Skeleton } from '@/components/ui/skeleton';
import { BioCard } from './UserBio';
import { PhotosCard } from '../cards/PhotoCard';
import { FriendsCard } from '../cards/FriendCard';
import { UserProfileActions } from './UserProfileAction';

interface UserSidebarProps {
  user: UserProfile;
  isLoggedIn: boolean;
}

export default function UserSidebar({ user, isLoggedIn }: UserSidebarProps) {
  const { data: friendsPreview, isLoading: isLoadingFriends } =
    useUserFriendsPreview(user.username);
  const { data: photosPreview, isLoading: isLoadingPhotos } =
    useUserPhotosPreview(user.username);

  if (isLoadingFriends || isLoadingPhotos) {
    return (
      <>
        <UserProfileActions user={user} isLoggedIn={isLoggedIn} />
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

  return (
    <>
      <UserProfileActions user={user} isLoggedIn={isLoggedIn} />
      <BioCard user={user} />
      <PhotosCard photos={photos} username={user.username} />
      <FriendsCard
        friends={friends}
        friendCount={user.friendCount || 0}
        username={user.username}
      />
    </>
  );
}
