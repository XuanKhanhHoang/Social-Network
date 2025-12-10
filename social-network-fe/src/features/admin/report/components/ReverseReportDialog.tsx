'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { ReportDto } from '../services/report.dto';

interface ReverseReportDialogProps {
  open: boolean;
  onClose: () => void;
  report: ReportDto | null;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export function ReverseReportDialog({
  open,
  onClose,
  report,
  onConfirm,
  isPending,
}: ReverseReportDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Xác nhận khôi phục bài viết
          </DialogTitle>
          <DialogDescription className="text-amber-600 bg-amber-50 p-3 rounded-md mt-2">
            Hành động này sẽ khôi phục bài viết và đánh dấu các báo cáo liên
            quan là <span className="font-medium">Bỏ qua</span>.
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-500">Loại nội dung:</p>
              <p className="font-medium">
                {report.targetType === 'post' ? 'Bài viết' : 'Bình luận'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Lý do khôi phục <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Admin xóa nhầm, Đã kiểm tra lại nội dung..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Lý do sẽ được lưu vào lịch sử xử lý của báo cáo.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !reason.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận khôi phục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
