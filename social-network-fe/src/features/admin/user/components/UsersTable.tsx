'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { UserListItem, UserStatus } from '../services/user.dto';
import { UserAvatar } from '@/components/ui/user-avatar';

interface UsersTableProps {
  data: UserListItem[] | undefined;
  isLoading: boolean;
  page: number;
  onViewDetail: (userId: string) => void;
  onEdit: (user: UserListItem) => void;
  onLock: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
  onRestore: (user: UserListItem) => void;
}

export function UsersTable({
  data,
  isLoading,
  page,
  onViewDetail,
  onEdit,
  onLock,
  onDelete,
  onRestore,
}: UsersTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (user: UserListItem) => {
    if (user.deletedAt) {
      return <Badge variant="destructive">Đã xóa</Badge>;
    }
    if (!user.isVerified) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Chưa kích hoạt
        </Badge>
      );
    }
    if (user.status === UserStatus.LOCKED) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Đã khóa
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Hoạt động
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Người dùng</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Ngày tham gia</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Đang tải...
            </TableCell>
          </TableRow>
        ) : data?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              Không tìm thấy người dùng nào
            </TableCell>
          </TableRow>
        ) : (
          data?.map((user, index) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">
                {(page - 1) * 10 + index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user.firstName}
                    src={user.avatar?.url}
                    className="h-9 w-9"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {user.lastName} {user.firstName}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                @{user.username}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {user.email}
              </TableCell>
              <TableCell>{getStatusBadge(user)}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetail(user._id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    {!user.deletedAt && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onLock(user)}>
                          {user.status === UserStatus.LOCKED ? (
                            <>
                              <Unlock className="mr-2 h-4 w-4" />
                              Mở khóa
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Khóa tài khoản
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa tài khoản
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.deletedAt && (
                      <DropdownMenuItem
                        className="text-green-600 focus:text-green-600"
                        onClick={() => onRestore(user)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Khôi phục
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
