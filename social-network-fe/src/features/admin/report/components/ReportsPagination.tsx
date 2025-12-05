'use client';

import { TablePagination } from '@/components/ui/table-pagination';

interface ReportsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function ReportsPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: ReportsPaginationProps) {
  return (
    <TablePagination
      page={page}
      totalPages={totalPages}
      total={total}
      label="báo cáo"
      onPageChange={onPageChange}
    />
  );
}
