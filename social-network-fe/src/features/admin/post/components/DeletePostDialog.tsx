'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { AdminPost } from '../types/post.types';

interface DeletePostDialogProps {
  open: boolean;
  onClose: () => void;
  post: AdminPost | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeletePostDialog({
  open,
  onClose,
  post,
  onConfirm,
  isPending,
}: DeletePostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Xác nhận xóa bài viết
          </DialogTitle>
          <DialogDescription>
            Bài viết sẽ được chuyển sang trạng thái đã xóa. Tất cả báo cáo đang
            chờ xử lý sẽ tự động được đánh dấu là đã giải quyết.
          </DialogDescription>
        </DialogHeader>

        {post && (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-500">ID bài viết:</p>
              <p className="font-medium font-mono">{post.id}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-500">Nội dung:</p>
              <p className="line-clamp-2">
                {post.plainText || '(Không có nội dung văn bản)'}
              </p>
            </div>
            {post.pendingReportsCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
                <strong>{post.pendingReportsCount}</strong> báo cáo đang chờ xử
                lý sẽ được tự động giải quyết.
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
