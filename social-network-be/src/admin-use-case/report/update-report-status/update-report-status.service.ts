import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReportStatus, ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { CreateNotificationService } from 'src/use-case/notification/create-notification/create-notification.service';
import { NotificationType } from 'src/share/enums';

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam hoặc quảng cáo',
  inappropriate: 'Nội dung không phù hợp',
  harassment: 'Quấy rối hoặc bắt nạt',
  hate_speech: 'Ngôn từ thù ghét',
  violence: 'Bạo lực hoặc đe dọa',
  misinformation: 'Thông tin sai lệch',
};

export type UpdateReportStatusInput = {
  reportId: string;
  status: ReportStatus;
  adminId: string;
  adminNote?: string;
};

export type UpdateReportStatusOutput = {
  _id: string;
  status: ReportStatus;
  message: string;
  targetDeleted?: boolean;
  totalReportsResolved?: number;
};

@Injectable()
export class UpdateReportStatusService extends BaseUseCaseService<
  UpdateReportStatusInput,
  UpdateReportStatusOutput
> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly createNotificationService: CreateNotificationService,
  ) {
    super();
  }

  async execute(
    input: UpdateReportStatusInput,
  ): Promise<UpdateReportStatusOutput> {
    const { reportId, status, adminId, adminNote } = input;

    const existingReport = await this.reportRepository.findById(reportId);
    if (!existingReport) {
      throw new NotFoundException('Report not found');
    }
    const report = await this.reportRepository.updateStatus(
      reportId,
      status,
      adminId,
      adminNote,
    );

    let targetDeleted = false;
    let totalReportsResolved = 1;
    let authorId: string | null = null;

    if (status === ReportStatus.RESOLVED) {
      const { targetType, targetId } = existingReport;

      if (targetType === ReportTargetType.POST) {
        const post = await this.postRepository.findLeanedById<{
          author: { _id: any };
        }>(targetId.toString());
        if (post) {
          authorId = post.author._id.toString();
        }
        await this.postRepository.softDelete(targetId.toString());
        targetDeleted = true;
      } else if (targetType === ReportTargetType.COMMENT) {
        const comment = await this.commentRepository.findById(
          targetId.toString(),
        );
        if (comment) {
          authorId = comment.author._id.toString();
        }
        await this.commentRepository.softDelete(targetId.toString());
        targetDeleted = true;
      }

      totalReportsResolved = await this.reportRepository.resolveAllForTarget(
        targetType,
        targetId.toString(),
        adminId,
        adminNote || 'Auto-resolved: Target has been removed',
      );

      if (authorId) {
        const reasonKey = existingReport.reason
          .toLowerCase()
          .replace(/ /g, '_');
        const reasonLabel =
          REASON_LABELS[reasonKey] || 'Vi phạm tiêu chuẩn cộng đồng';

        await this.createNotificationService.execute({
          receiver: authorId,
          type: NotificationType.CONTENT_REMOVED_VIOLATION,
          relatedId: reportId,
          relatedModel: 'Report',
          message: reasonLabel,
          metadata: {
            targetType: existingReport.targetType,
            targetId: existingReport.targetId.toString(),
            reason: reasonLabel,
          },
        });
      }

      await this.reportRepository.setNotifyReporterAt(
        reportId,
        new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      );
    }

    return {
      _id: report._id.toString(),
      status: report.status,
      message:
        status === ReportStatus.RESOLVED
          ? `Resolved and deleted the reported content. ${totalReportsResolved} reports resolved.`
          : 'Updated status successfully',
      targetDeleted,
      totalReportsResolved,
    };
  }
}
