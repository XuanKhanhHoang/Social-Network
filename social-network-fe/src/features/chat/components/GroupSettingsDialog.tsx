'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useGroupChat } from '../hooks/useGroupChat';
import { useStore } from '@/store';
import {
  Loader2,
  LogOut,
  Plus,
  Search,
  X,
  MoreVertical,
  ShieldAlert,
} from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSearchContact } from '../hooks/useSearchContact';
import { debounce } from 'lodash';
import { SuggestedMessagingUser } from '../types/chat';
import { toast } from 'sonner';
import { mediaService } from '@/features/media/services/media.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GroupSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  groupName: string;
  groupAvatar?: string;
}

export const GroupSettingsDialog = ({
  isOpen,
  onClose,
  conversationId,
  groupName: initialGroupName,
  groupAvatar,
}: GroupSettingsDialogProps) => {
  const {
    members,
    owner,
    updateGroup,
    addMembers,
    kickMember,
    leaveGroup,
    assignAdmin,
    deleteGroup,
    isUpdating,
    isAddingMembers,
    isKicking,
    isLeaving,
    isAssigningAdmin,
    isDeletingGroup,
    isMembersLoading,
  } = useGroupChat(conversationId);

  const currentUser = useStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('general');
  const [groupName, setGroupName] = useState(initialGroupName);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isOwner = currentUser?.id == owner;

  const handleAvatarClick = () => {
    if (!isOwner) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await mediaService.uploadMedia(file);
      await updateGroup({ avatar: res.url });
      toast.success('Đã cập nhật ảnh nhóm');
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const [isAddingMode, setIsAddingMode] = useState(false);
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

  const handleUpdateGroup = async () => {
    if (!groupName.trim() || groupName === initialGroupName) return;
    try {
      await updateGroup({ name: groupName });
      toast.success('Đã cập nhật tên nhóm');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await addMembers(selectedUsers.map((u) => u.id));
      toast.success('Đã thêm thành viên');
      setIsAddingMode(false);
      setSelectedUsers([]);
      setSearchTerm('');
    } catch {
      toast.error('Thêm thành viên thất bại');
    }
  };

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
    isProcessing: boolean;
  }>({
    title: '',
    description: '',
    action: async () => {},
    isProcessing: false,
  });

  const confirmAction = (
    title: string,
    description: string,
    action: () => Promise<void>,
    isProcessing: boolean
  ) => {
    setAlertConfig({
      title,
      description,
      action,
      isProcessing,
    });
    setAlertOpen(true);
  };

  const handleKickMember = (memberId: string) => {
    confirmAction(
      'Mời thành viên ra khỏi nhóm',
      'Bạn có chắc muốn mời người này ra khỏi nhóm?',
      async () => {
        try {
          await kickMember(memberId);
          toast.success('Đã mời thành viên ra khỏi nhóm');
        } catch {
          toast.error('Thất bại khi mời ra khỏi nhóm');
        }
      },
      isKicking
    );
  };

  const handleLeaveGroup = () => {
    if (isOwner) {
      toast.error(
        'Trưởng nhóm không thể rời nhóm. Hãy chuyển quyền trưởng nhóm hoặc xóa nhóm.'
      );
      return;
    }
    confirmAction(
      'Rời nhóm',
      'Bạn có chắc muốn rời nhóm?',
      async () => {
        try {
          await leaveGroup();
          onClose();
          toast.success('Đã rời nhóm');
        } catch {
          toast.error('Rời nhóm thất bại');
        }
      },
      isLeaving
    );
  };

  const handleAssignAdmin = (memberId: string) => {
    confirmAction(
      'Chuyển quyền trưởng nhóm',
      'Bạn có chắc muốn chuyển quyền trưởng nhóm cho thành viên này?',
      async () => {
        try {
          await assignAdmin(memberId);
          toast.success('Đã chuyển quyền trưởng nhóm');
        } catch {
          toast.error('Chuyển quyền thất bại');
        }
      },
      isAssigningAdmin
    );
  };

  const handleDeleteGroup = () => {
    confirmAction(
      'Giải tán nhóm',
      'HÀNH ĐỘNG NGUY HIỂM: Bạn có chắc muốn xóa nhóm này? Hành động này không thể hoàn tác.',
      async () => {
        try {
          await deleteGroup();
          onClose();
          toast.success('Đã xóa nhóm');
        } catch {
          toast.error('Xóa nhóm thất bại');
        }
      },
      isDeletingGroup
    );
  };

  const usersToDisplay =
    searchData?.data.filter(
      (user) =>
        !members.some((m) => m.id === user.id) &&
        !selectedUsers.some((selected) => selected.id === user.id)
    ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cài đặt nhóm</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="members">
              Thành viên ({members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="flex flex-col items-center gap-4">
              <div
                className={`relative group ${isOwner ? 'cursor-pointer' : ''}`}
                onClick={handleAvatarClick}
              >
                <UserAvatar
                  src={groupAvatar}
                  name={groupName}
                  className="h-20 w-20"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {isOwner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <div className="text-white text-xs font-medium">
                        Đổi ảnh
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isOwner ? (
                <div className="space-y-2 w-full">
                  <label className="text-sm font-medium">Tên nhóm</label>
                  <div className="flex gap-2">
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Nhập tên nhóm"
                    />
                    <Button
                      onClick={handleUpdateGroup}
                      disabled={isUpdating || groupName === initialGroupName}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Lưu'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{groupName}</h3>
                  <p className="text-sm text-gray-500">
                    Chỉ trưởng nhóm mới có thể thay đổi tên và ảnh nhóm.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex flex-col items-center gap-2">
              {isOwner ? (
                <div className="flex flex-col gap-2 w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="w-full">
                          <Button
                            variant="ghost"
                            className="w-full text-gray-500"
                            disabled={true}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Rời nhóm
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Trưởng nhóm phải chuyển quyền trước khi rời nhóm</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeleteGroup}
                    disabled={isDeletingGroup}
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    {isDeletingGroup ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Giải tán nhóm'
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="text-gray-500 hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLeaveGroup}
                  disabled={isLeaving}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Rời nhóm
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="members"
            className="flex-1 flex flex-col min-h-0 pt-4"
          >
            {!isAddingMode ? (
              <>
                {isOwner && (
                  <div className="mb-4">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setIsAddingMode(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm thành viên
                    </Button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {isMembersLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
                      >
                        <a
                          href={`/user/${member.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                        >
                          <UserAvatar
                            src={member.avatar?.url}
                            name={member.lastName + ' ' + member.firstName}
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {member.lastName} {member.firstName}
                            </div>
                            {member.id === owner && (
                              <div className="text-xs text-muted-foreground">
                                Trưởng nhóm
                              </div>
                            )}
                          </div>
                        </a>
                        {isOwner && member.id !== currentUser?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleAssignAdmin(member.id)}
                                disabled={isAssigningAdmin}
                              >
                                {isAssigningAdmin ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Chỉ định trưởng nhóm
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleKickMember(member.id)}
                                disabled={isKicking}
                              >
                                {isKicking ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Mời ra khỏi nhóm
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAddingMode(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">Thêm thành viên</span>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm người dùng..."
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

                <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-1 mb-4">
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

                <Button
                  onClick={handleAddMembers}
                  disabled={selectedUsers.length === 0 || isAddingMembers}
                >
                  {isAddingMembers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Thêm'
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={alertConfig.isProcessing}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await alertConfig.action();
                setAlertOpen(false);
              }}
              disabled={alertConfig.isProcessing}
            >
              {alertConfig.isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Xác nhận'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
