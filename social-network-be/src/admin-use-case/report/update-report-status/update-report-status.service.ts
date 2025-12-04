import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReportStatus, ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

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

    if (status === ReportStatus.RESOLVED) {
      const { targetType, targetId } = existingReport;

      if (targetType === ReportTargetType.POST) {
        await this.postRepository.softDelete(targetId.toString());
        targetDeleted = true;
      } else if (targetType === ReportTargetType.COMMENT) {
        await this.commentRepository.softDelete(targetId.toString());
        targetDeleted = true;
      }

      totalReportsResolved = await this.reportRepository.resolveAllForTarget(
        targetType,
        targetId.toString(),
        adminId,
        adminNote || 'Auto-resolved: Target has been removed',
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
