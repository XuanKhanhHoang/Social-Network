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
import { RotateCcw } from 'lucide-react';
import { AdminPost } from '../types/post.types';

interface RestorePostDialogProps {
  open: boolean;
  onClose: () => void;
  post: AdminPost | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function RestorePostDialog({
  open,
  onClose,
  post,
  onConfirm,
  isPending,
}: RestorePostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-500" />
            Xác nhận khôi phục bài viết
          </DialogTitle>
          <DialogDescription>
            Bài viết sẽ được khôi phục về trạng thái hoạt động. Lịch sử các báo
            cáo đã xử lý trước đó sẽ được giữ nguyên.
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
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận khôi phục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
