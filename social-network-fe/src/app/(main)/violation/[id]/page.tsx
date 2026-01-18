'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  FileText,
  MessageSquare,
  RefreshCw,
  Clock,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  useViolationDetail,
  useSubmitAppeal,
} from '@/features/report/hooks/useViolation';

const APPEAL_WINDOW_DAYS = 15;

const statusLabels: Record<string, string> = {
  pending: 'Đang xem xét',
  resolved: 'Vi phạm',
  rejected: 'Không vi phạm',
  appealed: 'Đang kháng nghị',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-red-100 text-red-800',
  rejected: 'bg-green-100 text-green-800',
  appealed: 'bg-orange-100 text-orange-800',
};

export default function ViolationDetailPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { data: violation, isLoading, error } = useViolationDetail(reportId);
  const submitAppeal = useSubmitAppeal();
  const [appealReason, setAppealReason] = useState('');

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

  if (error || !violation) {
    return (
      <div className="container max-w-xl mx-auto py-8 px-4">
        <Card className="rounded-md">
          <CardContent className="py-8 text-center text-muted-foreground">
            Không tìm thấy thông tin vi phạm
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRestored = violation.status === 'rejected';
  const isAppealing = violation.status === 'appealed';
  const reviewedAt = violation.reviewedAt
    ? new Date(violation.reviewedAt)
    : null;
  const daysSinceReview = reviewedAt
    ? differenceInDays(new Date(), reviewedAt)
    : 0;
  const canAppeal =
    violation.status === 'resolved' &&
    !violation.hasAppealed &&
    daysSinceReview <= APPEAL_WINDOW_DAYS;
  const daysRemaining = APPEAL_WINDOW_DAYS - daysSinceReview;
  const appealExpired =
    violation.status === 'resolved' &&
    !violation.hasAppealed &&
    daysSinceReview > APPEAL_WINDOW_DAYS;
  const appealRejected =
    violation.status === 'resolved' && violation.hasAppealed;

  const handleAppeal = () => {
    if (!appealReason.trim()) return;
    submitAppeal.mutate({ reportId, reason: appealReason });
  };

  return (
    <div className="container max-w-xl mx-auto py-8 px-4">
      <Card className="rounded-md">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Chi tiết vi phạm
            </CardTitle>
            <Badge className={`${statusColors[violation.status]} rounded-sm`}>
              {isRestored && <RefreshCw className="h-3 w-3 mr-1" />}
              {isAppealing && <Clock className="h-3 w-3 mr-1" />}
              {statusLabels[violation.status]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {violation.targetType === 'post' ? (
              <FileText className="h-4 w-4" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            <span>
              {violation.targetType === 'post' ? 'Bài viết' : 'Bình luận'}
            </span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(violation.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-sm p-3">
            <p className="text-sm font-medium text-red-800 mb-1">Lý do</p>
            <p className="text-sm text-red-700">{violation.reason}</p>
          </div>

          {isRestored && (
            <div className="bg-green-50 border border-green-200 rounded-sm p-3">
              <p className="text-sm text-green-700">
                Nội dung đã được khôi phục.
              </p>
            </div>
          )}

          {isAppealing && (
            <div className="bg-orange-50 border border-orange-200 rounded-sm p-3">
              <p className="text-sm text-orange-700">
                Kháng nghị của bạn đang được xem xét.
              </p>
              {violation.appealedAt && (
                <p className="text-xs text-orange-600 mt-1">
                  Gửi{' '}
                  {formatDistanceToNow(new Date(violation.appealedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              )}
            </div>
          )}

          {appealRejected && (
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-3">
              <p className="text-sm text-gray-700">
                Kháng nghị đã bị từ chối. Quyết định được giữ nguyên.
              </p>
            </div>
          )}

          {appealExpired && (
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-3">
              <p className="text-sm text-gray-600">
                Đã hết thời hạn kháng nghị ({APPEAL_WINDOW_DAYS} ngày).
              </p>
            </div>
          )}

          {canAppeal && (
            <div className="border-t pt-4 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 space-y-1">
                <p className="text-sm text-amber-700">
                  Bạn chỉ được kháng nghị 1 lần duy nhất.
                </p>
                <p className="text-xs text-amber-600">
                  Còn {daysRemaining} ngày để kháng nghị.
                </p>
              </div>

              <Textarea
                placeholder="Nhập lý do kháng nghị..."
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                className="rounded-sm resize-none"
                rows={3}
                disabled={submitAppeal.isPending}
              />

              <Button
                onClick={handleAppeal}
                disabled={!appealReason.trim() || submitAppeal.isPending}
                className="w-full rounded-sm"
              >
                {submitAppeal.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Gửi kháng nghị
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
