'use client';

import { TablePagination } from '@/components/ui/table-pagination';

interface PostsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange?: (page: number) => void;
  createPageUrl?: (page: number) => string;
}

export function PostsPagination({
  page,
  totalPages,
  total,
  onPageChange,
  createPageUrl,
}: PostsPaginationProps) {
  return (
    <TablePagination
      page={page}
      totalPages={totalPages}
      total={total}
      label="bài viết"
      onPageChange={onPageChange}
      createPageUrl={createPageUrl}
    />
  );
}
