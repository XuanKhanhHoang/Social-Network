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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportDto } from '../services/report.dto';

interface ReportActionDialogProps {
  open: boolean;
  onClose: () => void;
  report: ReportDto | null;
  actionType: 'resolve' | 'reject' | null;
  adminNote: string;
  onAdminNoteChange: (note: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ReportActionDialog({
  open,
  onClose,
  report,
  actionType,
  adminNote,
  onAdminNoteChange,
  onConfirm,
  isPending,
}: ReportActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === 'resolve' ? 'Xác nhận vi phạm' : 'Bỏ qua báo cáo'}
          </DialogTitle>
          <DialogDescription>
            {actionType === 'resolve'
              ? 'Nội dung này sẽ bị xóa sau khi xác nhận vi phạm.'
              : 'Bỏ qua báo cáo này, nội dung sẽ được giữ nguyên.'}
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-500">Lý do báo cáo:</p>
              <p>{report.reason}</p>
            </div>

            {actionType === 'resolve' && (
              <div className="space-y-2">
                <Label>Ghi chú của admin (tùy chọn)</Label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => onAdminNoteChange(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={
              actionType === 'resolve' ? 'bg-red-600 hover:bg-red-700' : ''
            }
          >
            {isPending
              ? 'Đang xử lý...'
              : actionType === 'resolve'
              ? 'Xác nhận vi phạm & xóa'
              : 'Xác nhận bỏ qua'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
