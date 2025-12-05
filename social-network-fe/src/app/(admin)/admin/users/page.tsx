'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  useAdminUsers,
  useUpdateUser,
  useLockUser,
  useDeleteUser,
  useRestoreUser,
  useUserDetail,
} from '@/features/admin/user/hooks/useAdminUser';
import {
  UserListItem,
  UserStatus,
  UpdateUserDto,
} from '@/features/admin/user/services/user.dto';
import { UserFilters } from '@/features/admin/user/components/UserFilters';
import { UsersTable } from '@/features/admin/user/components/UsersTable';
import { UsersPagination } from '@/features/admin/user/components/UsersPagination';
import { UserDetailDialog } from '@/features/admin/user/components/UserDetailDialog';
import { UserEditDialog } from '@/features/admin/user/components/UserEditDialog';
import { UserActionDialog } from '@/features/admin/user/components/UserActionDialog';

const AdminUsersPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read from URL params
  const statusFilter =
    (searchParams.get('status') as
      | UserStatus
      | 'all'
      | 'inactive'
      | 'deleted') || 'all';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  // Update URL params
  const updateParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      const shouldRemove =
        value === null ||
        value === '' ||
        (key === 'status' && value === 'all') ||
        (key === 'page' && value === 1);

      if (shouldRemove) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const setStatusFilter = (
    status: UserStatus | 'all' | 'inactive' | 'deleted'
  ) => {
    updateParams({ status, page: 1 });
  };

  const setSearch = (value: string) => {
    updateParams({ search: value, page: 1 });
  };

  const setPage = (newPage: number) => {
    updateParams({ page: newPage });
  };

  // State for dialogs
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'lock' | 'delete' | 'restore' | null
  >(null);

  // Queries & Mutations
  const { data, isLoading } = useAdminUsers({
    page,
    limit: 10,
    search,
    status:
      statusFilter !== 'all' &&
      statusFilter !== 'inactive' &&
      statusFilter !== 'deleted'
        ? (statusFilter as UserStatus)
        : undefined,
    isVerified: statusFilter === 'inactive' ? false : undefined,
    isDeleted: statusFilter === 'deleted' ? true : undefined,
  });

  const { data: userDetail, isLoading: isLoadingDetail } =
    useUserDetail(detailUserId);

  const updateMutation = useUpdateUser();
  const lockMutation = useLockUser();
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();

  // Handlers
  const handleEdit = (userId: string, data: UpdateUserDto) => {
    updateMutation.mutate(
      { userId, data },
      {
        onSuccess: () => {
          toast.success('Cập nhật thông tin thành công');
          setIsEditOpen(false);
          setSelectedUser(null);
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi cập nhật');
        },
      }
    );
  };

  const handleActionConfirm = () => {
    if (!selectedUser || !actionType) return;

    const onSuccess = (message: string) => {
      toast.success(message);
      setActionType(null);
      setSelectedUser(null);
    };

    const onError = () => {
      toast.error('Có lỗi xảy ra');
    };

    if (actionType === 'lock') {
      lockMutation.mutate(selectedUser._id, {
        onSuccess: () =>
          onSuccess(
            selectedUser.status === UserStatus.LOCKED
              ? 'Đã mở khóa tài khoản'
              : 'Đã khóa tài khoản'
          ),
        onError,
      });
    } else if (actionType === 'delete') {
      deleteMutation.mutate(selectedUser._id, {
        onSuccess: () => onSuccess('Đã xóa tài khoản'),
        onError,
      });
    } else if (actionType === 'restore') {
      restoreMutation.mutate(selectedUser._id, {
        onSuccess: () => onSuccess('Đã khôi phục tài khoản'),
        onError,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Quản lý người dùng</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg border">
          <UserFilters
            search={search}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
          />

          <UsersTable
            data={data?.data}
            isLoading={isLoading}
            page={page}
            onViewDetail={setDetailUserId}
            onEdit={(user) => {
              setSelectedUser(user);
              setIsEditOpen(true);
            }}
            onLock={(user) => {
              setSelectedUser(user);
              setActionType('lock');
            }}
            onDelete={(user) => {
              setSelectedUser(user);
              setActionType('delete');
            }}
            onRestore={(user) => {
              setSelectedUser(user);
              setActionType('restore');
            }}
          />

          {data && (
            <UsersPagination
              page={page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              onPageChange={setPage}
              createPageUrl={(newPage) => {
                const params = new URLSearchParams(searchParams.toString());
                if (newPage === 1) {
                  params.delete('page');
                } else {
                  params.set('page', String(newPage));
                }
                return `${pathname}?${params.toString()}`;
              }}
            />
          )}
        </div>
      </div>

      <UserDetailDialog
        open={!!detailUserId}
        onClose={() => setDetailUserId(null)}
        user={userDetail}
        isLoading={isLoadingDetail}
      />

      <UserEditDialog
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onConfirm={handleEdit}
        isPending={updateMutation.isPending}
      />

      <UserActionDialog
        open={!!actionType}
        onClose={() => {
          setActionType(null);
          setSelectedUser(null);
        }}
        user={selectedUser}
        actionType={actionType}
        onConfirm={handleActionConfirm}
        isPending={
          lockMutation.isPending ||
          deleteMutation.isPending ||
          restoreMutation.isPending
        }
      />
    </div>
  );
};

export default AdminUsersPage;
