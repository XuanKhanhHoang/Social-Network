'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useSearchContact } from '@/features/chat/hooks/useSearchContact';
import { SuggestedMessagingUser } from '@/features/chat/types/chat';
import { DialogDescription } from '@radix-ui/react-dialog';
import { debounce } from 'lodash';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export const CreateGroupModal = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SuggestedMessagingUser[]>(
    []
  );

  const { data: searchData, isLoading: isSearching } =
    useSearchContact(searchTerm);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const toggleUser = (user: SuggestedMessagingUser) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    await onCreate(
      groupName,
      selectedUsers.map((u) => u.id)
    );
    onClose();
    setGroupName('');
    setSelectedUsers([]);
    setSearchTerm('');
  };

  const usersToDisplay =
    searchData?.data.filter(
      (user) => !selectedUsers.some((selected) => selected.id === user.id)
    ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo nhóm mới</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Đặt tên nhóm và thêm thành viên.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên nhóm</label>
            <Input
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Thêm thành viên</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                className="pl-8"
                onChange={handleSearchChange}
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                  >
                    <UserAvatar
                      src={user.avatar}
                      name={user.name}
                      className="h-4 w-4"
                    />
                    <span>{user.name}</span>
                    <button
                      onClick={() => toggleUser(user)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="h-[200px] overflow-y-auto border rounded-md p-2 space-y-1">
              {isSearching ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : usersToDisplay.length === 0 && searchTerm ? (
                <div className="text-center text-sm text-muted-foreground p-2">
                  Không tìm thấy kết quả
                </div>
              ) : (
                usersToDisplay.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => toggleUser(user)}
                  >
                    <UserAvatar
                      src={user.avatar}
                      name={user.name}
                      className="h-8 w-8"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !groupName.trim() || selectedUsers.length === 0 || isLoading
            }
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Tạo nhóm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
