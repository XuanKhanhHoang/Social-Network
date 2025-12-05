'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  label?: string;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

export function TablePagination({
  page,
  totalPages,
  total,
  label = 'mục',
  onPageChange,
  showInfo = true,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="p-4 border-t">
      {showInfo && total !== undefined && (
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">
            Trang {page} / {totalPages} (Tổng: {total} {label})
          </div>
        </div>
      )}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && onPageChange(page - 1)}
              className={
                page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
            />
          </PaginationItem>

          {page > 2 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(1)}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {page > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (page <= 2) {
              pageNum = i + 1;
            } else if (page >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = page - 1 + i;
            }
            if (pageNum < 1 || pageNum > totalPages) return null;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => onPageChange(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {page < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {page < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(totalPages)}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && onPageChange(page + 1)}
              className={
                page === totalPages
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
