'use client';

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
import { UserListItem, UserStatus } from '../services/user.dto';

interface UserActionDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserListItem | null;
  actionType: 'lock' | 'delete' | 'restore' | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function UserActionDialog({
  open,
  onClose,
  user,
  actionType,
  onConfirm,
  isPending,
}: UserActionDialogProps) {
  if (!user || !actionType) return null;

  const getTitle = () => {
    switch (actionType) {
      case 'lock':
        return user.status === UserStatus.LOCKED
          ? 'Mở khóa tài khoản?'
          : 'Khóa tài khoản?';
      case 'delete':
        return 'Xóa tài khoản?';
      case 'restore':
        return 'Khôi phục tài khoản?';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case 'lock':
        return user.status === UserStatus.LOCKED
          ? `Bạn có chắc chắn muốn mở khóa cho tài khoản @${user.username}? Người dùng sẽ có thể đăng nhập lại.`
          : `Bạn có chắc chắn muốn khóa tài khoản @${user.username}? Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.`;
      case 'delete':
        return `Bạn có chắc chắn muốn xóa tài khoản @${user.username}? Tài khoản sẽ bị vô hiệu hóa và chuyển vào thùng rác.`;
      case 'restore':
        return `Bạn có chắc chắn muốn khôi phục tài khoản @${user.username}? Tài khoản sẽ hoạt động trở lại.`;
      default:
        return '';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className={
              actionType === 'delete' ||
              (actionType === 'lock' && user.status !== UserStatus.LOCKED)
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
