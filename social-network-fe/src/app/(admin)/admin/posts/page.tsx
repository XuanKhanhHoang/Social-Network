'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  useAdminPosts,
  useDeletePost,
  useRestorePost,
} from '@/features/admin/post/hooks/useAdminPost';
import { AdminPost } from '@/features/admin/post/types/post.types';
import { PostsTable } from '@/features/admin/post/components/PostsTable';
import { PostFilters } from '@/features/admin/post/components/PostFilters';
import { PostsPagination } from '@/features/admin/post/components/PostsPagination';
import { DeletePostDialog } from '@/features/admin/post/components/DeletePostDialog';
import { RestorePostDialog } from '@/features/admin/post/components/RestorePostDialog';
import { PostContentDialog } from '@/features/admin/post/components/PostContentDialog';

type StatusFilter = 'active' | 'deleted' | 'all';

const AdminPostsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusFilter = (searchParams.get('status') as StatusFilter) || 'all';
  const searchId = searchParams.get('searchId') || '';
  const page = Number(searchParams.get('page')) || 1;

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

  const setStatusFilter = (status: StatusFilter) => {
    updateParams({ status, page: 1 });
  };

  const handleSearch = (id: string) => {
    updateParams({ searchId: id || null, page: 1 });
  };

  const setPage = (newPage: number) => {
    updateParams({ page: newPage });
  };

  const [previewPost, setPreviewPost] = useState<AdminPost | null>(null);
  const [deletePost, setDeletePost] = useState<AdminPost | null>(null);
  const [restorePost, setRestorePost] = useState<AdminPost | null>(null);

  const { data, isLoading } = useAdminPosts({
    page,
    limit: 10,
    searchId: searchId || undefined,
    includeDeleted: statusFilter === 'all' || statusFilter === 'deleted',
  });

  const deleteMutation = useDeletePost();
  const restoreMutation = useRestorePost();

  const handleDelete = () => {
    if (!deletePost) return;
    deleteMutation.mutate(deletePost.id, {
      onSuccess: (result) => {
        toast.success(result.message);
        setDeletePost(null);
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa bài viết');
      },
    });
  };

  const handleRestore = () => {
    if (!restorePost) return;
    restoreMutation.mutate(restorePost.id, {
      onSuccess: (result) => {
        toast.success(result.message);
        setRestorePost(null);
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi khôi phục bài viết');
      },
    });
  };

  const filteredPosts = data?.posts.filter((post) => {
    if (statusFilter === 'all') return true;
    return post.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Quản lý bài viết</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg border">
          <PostFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onSearch={handleSearch}
            initialSearchValue={searchId}
          />

          <PostsTable
            data={filteredPosts}
            isLoading={isLoading}
            page={page}
            onPreview={setPreviewPost}
            onDelete={setDeletePost}
            onRestore={setRestorePost}
          />

          {data && (
            <PostsPagination
              page={page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <PostContentDialog
        open={!!previewPost}
        onClose={() => setPreviewPost(null)}
        post={previewPost}
      />

      <DeletePostDialog
        open={!!deletePost}
        onClose={() => setDeletePost(null)}
        post={deletePost}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />

      <RestorePostDialog
        open={!!restorePost}
        onClose={() => setRestorePost(null)}
        post={restorePost}
        onConfirm={handleRestore}
        isPending={restoreMutation.isPending}
      />
    </div>
  );
};

export default AdminPostsPage;
