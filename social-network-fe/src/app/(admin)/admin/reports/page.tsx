'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  useAdminReports,
  useUpdateReportStatus,
  useReportTarget,
  useReverseReport,
} from '@/features/admin/report/hooks/useReport';
import {
  ReportDto,
  ReportStatus,
  ReportTargetType,
} from '@/features/admin/report/services/report.dto';
import { ReportFilters } from '@/features/admin/report/components/ReportFilters';
import { ReportsTable } from '@/features/admin/report/components/ReportsTable';
import { ReportsPagination } from '@/features/admin/report/components/ReportsPagination';
import { ContentPreviewDialog } from '@/features/admin/report/components/ContentPreviewDialog';
import { ReportActionDialog } from '@/features/admin/report/components/ReportActionDialog';
import { ReviewDetailDialog } from '@/features/admin/report/components/ReviewDetailDialog';
import { ReverseReportDialog } from '@/features/admin/report/components/ReverseReportDialog';

const AdminReportsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusFilter =
    (searchParams.get('status') as ReportStatus | 'all') || 'pending';
  const typeFilter =
    (searchParams.get('type') as ReportTargetType | 'all') || 'all';
  const page = Number(searchParams.get('page')) || 1;

  const updateParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      const shouldRemove =
        value === null ||
        (key === 'status' && value === 'pending') ||
        (key === 'type' && value === 'all') ||
        (key === 'page' && value === 1);

      if (shouldRemove) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const setStatusFilter = (status: ReportStatus | 'all') => {
    updateParams({ status, page: 1 });
  };

  const setTypeFilter = (type: ReportTargetType | 'all') => {
    updateParams({ type, page: 1 });
  };

  const setPage = (newPage: number) => {
    updateParams({ page: newPage });
  };

  const [selectedReport, setSelectedReport] = useState<ReportDto | null>(null);
  const [actionType, setActionType] = useState<'resolve' | 'reject' | null>(
    null
  );
  const [adminNote, setAdminNote] = useState('');
  const [previewReportId, setPreviewReportId] = useState<string | null>(null);
  const [reviewDetailReport, setReviewDetailReport] =
    useState<ReportDto | null>(null);
  const [reverseReport, setReverseReport] = useState<ReportDto | null>(null);

  const { data, isLoading } = useAdminReports({
    page,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
    targetType: typeFilter === 'all' ? undefined : typeFilter,
  });

  const updateMutation = useUpdateReportStatus();
  const reverseMutation = useReverseReport();
  const { data: targetData, isLoading: isLoadingTarget } =
    useReportTarget(previewReportId);

  const openActionDialog = (
    report: ReportDto,
    action: 'resolve' | 'reject'
  ) => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNote('');
  };

  const closeActionDialog = () => {
    setSelectedReport(null);
    setActionType(null);
    setAdminNote('');
  };

  const handleAction = () => {
    if (!selectedReport || !actionType) return;
    updateMutation.mutate(
      {
        reportId: selectedReport._id,
        data: {
          status: actionType === 'resolve' ? 'resolved' : 'rejected',
          adminNote: adminNote || undefined,
        },
      },
      {
        onSuccess: (result) => {
          toast.success(result.message);
          closeActionDialog();
        },
        onError: () => {
          toast.error('Có lỗi xảy ra');
        },
      }
    );
  };

  const handleReverse = (reason: string) => {
    if (!reverseReport) return;
    reverseMutation.mutate(
      {
        reportId: reverseReport._id,
        data: { reason },
      },
      {
        onSuccess: (result) => {
          toast.success('Đã khôi phục bài viết thành công');
          setReverseReport(null);
        },
        onError: (error: Error & { response?: { status?: number } }) => {
          if (error?.response?.status === 404) {
            toast.error(
              'Không thể khôi phục bài viết này. Bài viết có thể đã bị xóa vĩnh viễn.'
            );
          } else {
            toast.error('Có lỗi xảy ra khi khôi phục');
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Quản lý báo cáo vi phạm</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg border">
          <ReportFilters
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
          />

          <ReportsTable
            data={data?.data}
            isLoading={isLoading}
            page={page}
            onPreview={setPreviewReportId}
            onResolve={(report) => openActionDialog(report, 'resolve')}
            onReject={(report) => openActionDialog(report, 'reject')}
            onViewDetail={setReviewDetailReport}
            onReverse={setReverseReport}
          />

          {data && (
            <ReportsPagination
              page={page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <ContentPreviewDialog
        open={!!previewReportId}
        onClose={() => setPreviewReportId(null)}
        data={targetData}
        isLoading={isLoadingTarget}
      />

      <ReportActionDialog
        open={!!selectedReport && !!actionType}
        onClose={closeActionDialog}
        report={selectedReport}
        actionType={actionType}
        adminNote={adminNote}
        onAdminNoteChange={setAdminNote}
        onConfirm={handleAction}
        isPending={updateMutation.isPending}
      />

      <ReviewDetailDialog
        open={!!reviewDetailReport}
        onClose={() => setReviewDetailReport(null)}
        report={reviewDetailReport}
      />

      <ReverseReportDialog
        open={!!reverseReport}
        onClose={() => setReverseReport(null)}
        report={reverseReport}
        onConfirm={handleReverse}
        isPending={reverseMutation.isPending}
      />
    </div>
  );
};

export default AdminReportsPage;
