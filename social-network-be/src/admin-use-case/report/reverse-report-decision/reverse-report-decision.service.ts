import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReportStatus, ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type ReverseReportDecisionInput = {
  reportId: string;
  adminId: string;
  reason: string;
};

export type ReverseReportDecisionOutput = {
  success: boolean;
  message: string;
  targetRestored: boolean;
  totalReportsReversed: number;
};

@Injectable()
export class ReverseReportDecisionService extends BaseUseCaseService<
  ReverseReportDecisionInput,
  ReverseReportDecisionOutput
> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {
    super();
  }

  async execute(
    input: ReverseReportDecisionInput,
  ): Promise<ReverseReportDecisionOutput> {
    const { reportId, adminId, reason } = input;

    const existingReport = await this.reportRepository.findById(reportId);
    if (!existingReport) {
      throw new NotFoundException('Report not found');
    }

    if (existingReport.status !== ReportStatus.RESOLVED) {
      throw new BadRequestException(
        `Cannot reverse a report that is not in 'resolved' status. Current status: ${existingReport.status}`,
      );
    }

    const { targetType, targetId } = existingReport;

    let targetRestored = false;

    if (targetType === ReportTargetType.POST) {
      targetRestored = await this.postRepository.restore(targetId.toString());
      if (!targetRestored) {
        throw new NotFoundException(
          'Post not found or already permanently deleted. Cannot restore.',
        );
      }
    } else if (targetType === ReportTargetType.COMMENT) {
      targetRestored = await this.commentRepository.restore(
        targetId.toString(),
      );
      if (!targetRestored) {
        throw new NotFoundException(
          'Comment not found or already permanently deleted. Cannot restore.',
        );
      }
    }

    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);
    const reversalNote = `[${timestamp}] Admin ${adminId}: ${reason}`;

    const totalReportsReversed =
      await this.reportRepository.rejectResolvedForTarget(
        targetType,
        targetId.toString(),
        adminId,
        reversalNote,
      );

    return {
      success: true,
      message: `Successfully reversed decision. Restored ${targetType} and updated ${totalReportsReversed} report(s) to 'rejected'.`,
      targetRestored,
      totalReportsReversed,
    };
  }
}
