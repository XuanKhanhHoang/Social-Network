'use client';

import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useSubmitReport } from '../hooks/useReport';
import { ReportTargetType } from '../types/report.dto';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam hoặc quảng cáo' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'harassment', label: 'Quấy rối hoặc bắt nạt' },
  { value: 'hate_speech', label: 'Ngôn từ thù ghét' },
  { value: 'violence', label: 'Bạo lực hoặc đe dọa' },
  { value: 'misinformation', label: 'Thông tin sai lệch' },
  { value: 'other', label: 'Lý do khác' },
];

export function ReportDialog({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  const submitReport = useSubmitReport();

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }

    const reason =
      selectedReason === 'other'
        ? customReason.trim()
        : REPORT_REASONS.find((r) => r.value === selectedReason)?.label || '';

    if (selectedReason === 'other' && !customReason.trim()) {
      toast.error('Vui lòng nhập lý do báo cáo');
      return;
    }

    submitReport.mutate(
      { targetType, targetId, reason },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const targetLabel = targetType === 'post' ? 'bài viết' : 'bình luận';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Báo cáo {targetLabel}
          </DialogTitle>
          <DialogDescription>
            Cho chúng tôi biết lý do bạn muốn báo cáo {targetLabel} này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={selectedReason}
            onValueChange={setSelectedReason}
            className="space-y-2"
          >
            {REPORT_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value} className="cursor-pointer">
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Mô tả chi tiết</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập lý do báo cáo của bạn..."
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">
                {customReason.length}/500
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Báo cáo sẽ được gửi đến quản trị viên để xem xét. Chúng tôi sẽ xử
              lý trong thời gian sớm nhất.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitReport.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitReport.isPending || !selectedReason}
            className="bg-red-500 hover:bg-red-600"
          >
            {submitReport.isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
