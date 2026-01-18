'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, X } from 'lucide-react';
import { ReportDto } from '../services/report.dto';

interface ResolveAppealDialogProps {
  report: ReportDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (
    reportId: string,
    accepted: boolean,
    adminNote?: string
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ResolveAppealDialog({
  report,
  open,
  onOpenChange,
  onResolve,
  isLoading,
}: ResolveAppealDialogProps) {
  const [adminNote, setAdminNote] = useState('');

  const handleResolve = async (accepted: boolean) => {
    if (!report) return;
    await onResolve(report._id, accepted, adminNote || undefined);
    setAdminNote('');
    onOpenChange(false);
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xử lý kháng nghị</DialogTitle>
          <DialogDescription>
            Xem xét và quyết định kháng nghị của người dùng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <p className="text-sm font-medium text-orange-800 mb-1">
              Lý do kháng nghị
            </p>
            <p className="text-sm text-orange-700">
              {report.appealReason || 'Không có lý do'}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-sm font-medium text-gray-800 mb-1">
              Lý do vi phạm ban đầu
            </p>
            <p className="text-sm text-gray-700">{report.reason}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Ghi chú admin (tùy chọn)
            </label>
            <Textarea
              placeholder="Nhập ghi chú về quyết định..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => handleResolve(false)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            Từ chối kháng nghị
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleResolve(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Chấp nhận kháng nghị
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
