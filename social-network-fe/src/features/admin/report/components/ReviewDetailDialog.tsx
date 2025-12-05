'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReportDto } from '../services/report.dto';
import { statusLabels, statusColors, formatExactTime } from './ReportsTable';

interface ReviewDetailDialogProps {
  open: boolean;
  onClose: () => void;
  report: ReportDto | null;
}

export function ReviewDetailDialog({
  open,
  onClose,
  report,
}: ReviewDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết xử lý báo cáo</DialogTitle>
        </DialogHeader>

        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">Thời gian xử lý</p>
                <p className="font-medium">
                  {report.reviewedAt
                    ? formatExactTime(report.reviewedAt)
                    : 'Chưa xử lý'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">Kết quả</p>
                <Badge
                  className={statusColors[report.status]}
                  variant="secondary"
                >
                  {statusLabels[report.status]}
                </Badge>
              </div>
            </div>

            {report.adminNote && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">Ghi chú của admin</p>
                <p className="text-sm">{report.adminNote}</p>
              </div>
            )}

            {!report.adminNote && (
              <div className="bg-gray-50 p-3 rounded text-center text-gray-500">
                Không có ghi chú
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
