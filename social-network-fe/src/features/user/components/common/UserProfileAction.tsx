'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/features/user/types';
import { UserPlus, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FriendshipStatus } from '@/lib/constants/enums/friendship-status';
import { useGetAccount } from '@/features/user/hooks/useUser';

interface UserProfileActionsProps {
  user: UserProfile;
  isLoggedIn: boolean;
}

export function UserProfileActions({
  user,
  isLoggedIn,
}: UserProfileActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();
  const { data: account } = useGetAccount();

  const isOwner = isLoggedIn && account?.username === user.username;

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    // const data = {
    //   bio: formData.get('bio') as string,
    //   work: formData.get('work') as string,
    //   currentLocation: formData.get('location') as string,
    // };

    // TODO:  mutation
    // updateProfileMutation.mutate(data, {
    //   onSuccess: () => {
    //     setIsEditDialogOpen(false); // Đóng dialog khi thành công
    //   }
    // });

    // Tạm thời đóng dialog
    setIsEditDialogOpen(false);
  };

  // TODO:  friend handler
  const handleAddFriend = () => {
    // addFriendMutation.mutate(user.username);
  };

  const handleUnfriend = () => {
    // unfriendMutation.mutate(user.username);
  };

  const renderActionButtons = () => {
    if (!isLoggedIn) {
      return (
        <Button className="w-full" onClick={() => router.push('/login')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Đăng nhập để thêm bạn
        </Button>
      );
    }

    if (isOwner) {
      return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              Chỉnh sửa chi tiết
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa chi tiết</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bio" className="text-right">
                    Tiểu sử
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={user.bio}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="work" className="text-right">
                    Nơi làm việc
                  </Label>
                  <Input
                    id="work"
                    name="work"
                    defaultValue={user.work}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Nơi sống
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={user.currentLocation}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Hủy
                  </Button>
                </DialogClose>
                <Button type="submit">Lưu thay đổi</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }

    switch (user.userProfileType) {
      case FriendshipStatus.ACCEPTED:
        return (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleUnfriend}
          >
            <UserX className="mr-2 h-4 w-4" /> Bạn bè
          </Button>
        );
      case FriendshipStatus.PENDING:
        return (
          <Button variant="secondary" className="w-full" disabled>
            Đã gửi lời mời
          </Button>
        );
      case FriendshipStatus.DECLINED: // Or null/undefined
      case null:
      default:
        return (
          <Button className="w-full" onClick={handleAddFriend}>
            <UserPlus className="mr-2 h-4 w-4" /> Thêm bạn bè
          </Button>
        );
    }
  };

  return <div className="w-full">{renderActionButtons()}</div>;
}
