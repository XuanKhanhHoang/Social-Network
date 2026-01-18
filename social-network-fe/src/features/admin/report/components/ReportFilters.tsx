'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportStatus, ReportTargetType } from '../services/report.dto';

interface ReportFiltersProps {
  statusFilter: ReportStatus | 'all';
  typeFilter: ReportTargetType | 'all';
  onStatusChange: (value: ReportStatus | 'all') => void;
  onTypeChange: (value: ReportTargetType | 'all') => void;
}

export function ReportFilters({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
}: ReportFiltersProps) {
  return (
    <div className="p-4 border-b flex gap-4">
      <Select
        value={statusFilter}
        onValueChange={(v) => onStatusChange(v as ReportStatus | 'all')}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="pending">Chờ xử lý</SelectItem>
          <SelectItem value="appealed">Đang kháng nghị</SelectItem>
          <SelectItem value="resolved">Vi phạm</SelectItem>
          <SelectItem value="rejected">Bỏ qua</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={typeFilter}
        onValueChange={(v) => onTypeChange(v as ReportTargetType | 'all')}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="post">Bài viết</SelectItem>
          <SelectItem value="comment">Bình luận</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
