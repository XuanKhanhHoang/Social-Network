'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserDetail, UserStatus } from '../services/user.dto';
import {
  Mail,
  Calendar,
  User,
  Shield,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserDetail | undefined;
  isLoading: boolean;
}

export function UserDetailDialog({
  open,
  onClose,
  user,
  isLoading,
}: UserDetailDialogProps) {
  if (!user && !isLoading) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <UserAvatar
                name={user.firstName}
                src={user.avatar?.url}
                className="h-16 w-16"
                size={64}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold truncate">
                    {user.lastName} {user.firstName}
                  </h3>
                  <Badge
                    variant={
                      user.status === UserStatus.ACTIVE
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {user.status === UserStatus.ACTIVE
                      ? 'Hoạt động'
                      : 'Đã khóa'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  @{user.username}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Giới tính
                </span>
                <p className="text-sm font-medium capitalize">
                  {user.gender === 'male'
                    ? 'Nam'
                    : user.gender === 'female'
                    ? 'Nữ'
                    : 'Khác'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Ngày sinh
                </span>
                <p className="text-sm font-medium">
                  {formatDate(user.birthDate)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> User ID
                </span>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {user._id}
                </code>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Ngày tạo
                </span>
                <p className="text-sm font-medium">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border text-sm">
              <span className="text-muted-foreground">
                Trạng thái xác thực email
              </span>
              {user.isVerified ? (
                <div className="flex items-center gap-1.5 text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Đã xác thực
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <XCircle className="h-4 w-4" /> Chưa xác thực
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
