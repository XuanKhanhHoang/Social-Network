'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, FileText, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useReportResult } from '@/features/report/hooks/useViolation';

export default function ReportResultPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { data: report, isLoading, error } = useReportResult(reportId);

  if (isLoading) {
    return (
      <div className="container max-w-xl mx-auto py-8 px-4">
        <Card className="rounded-md">
          <CardContent className="py-8 text-center text-muted-foreground">
            Đang tải...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container max-w-xl mx-auto py-8 px-4">
        <Card className="rounded-md">
          <CardContent className="py-8 text-center text-muted-foreground">
            Không tìm thấy thông tin báo cáo
          </CardContent>
        </Card>
      </div>
    );
  }

  const isViolation = report.status === 'resolved';

  return (
    <div className="container max-w-xl mx-auto py-8 px-4">
      <Card className="rounded-md">
        <CardHeader className="border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            {isViolation ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-500" />
            )}
            Kết quả báo cáo
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {report.targetType === 'post' ? (
              <FileText className="h-4 w-4" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            <span>
              {report.targetType === 'post' ? 'Bài viết' : 'Bình luận'}
            </span>
            <span>•</span>
            <span>
              Báo cáo{' '}
              {formatDistanceToNow(new Date(report.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>

          {isViolation ? (
            <div className="bg-green-50 border border-green-200 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">
                  Vi phạm đã được xử lý
                </p>
              </div>
              <p className="text-sm text-green-700">
                Cảm ơn bạn đã báo cáo. Nội dung vi phạm đã được gỡ bỏ khỏi hệ
                thống.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-gray-600" />
                <p className="font-medium text-gray-800">
                  Không phát hiện vi phạm
                </p>
              </div>
              <p className="text-sm text-gray-700">
                Chúng tôi đã xem xét báo cáo của bạn và không phát hiện vi phạm
                tiêu chuẩn cộng đồng.
              </p>
            </div>
          )}

          {report.reviewedAt && (
            <p className="text-xs text-muted-foreground text-center">
              Xử lý{' '}
              {formatDistanceToNow(new Date(report.reviewedAt), {
                addSuffix: true,
                locale: vi,
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
