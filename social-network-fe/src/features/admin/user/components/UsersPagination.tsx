'use client';

import { TablePagination } from '@/components/ui/table-pagination';

interface UsersPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange?: (page: number) => void;
  createPageUrl?: (page: number) => string;
}

export function UsersPagination({
  page,
  totalPages,
  total,
  onPageChange,
  createPageUrl,
}: UsersPaginationProps) {
  return (
    <TablePagination
      page={page}
      totalPages={totalPages}
      total={total}
      label="người dùng"
      onPageChange={onPageChange}
      createPageUrl={createPageUrl}
    />
  );
}
