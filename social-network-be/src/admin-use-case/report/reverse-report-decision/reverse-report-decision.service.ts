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
import { CreateNotificationService } from 'src/use-case/notification/create-notification/create-notification.service';
import { NotificationType } from 'src/share/enums';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
    private readonly createNotificationService: CreateNotificationService,
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

    if (existingReport.reviewedAt) {
      const daysSinceReview = Date.now() - existingReport.reviewedAt.getTime();
      if (daysSinceReview > THIRTY_DAYS_MS) {
        throw new BadRequestException(
          'The violation was dealt with 30 days ago and cannot be restored.',
        );
      }
    }

    const { targetType, targetId } = existingReport;

    let targetRestored = false;
    let authorId: string | null = null;

    if (targetType === ReportTargetType.POST) {
      const post = await this.postRepository.findLeanedById<{
        author: { _id: any };
      }>(targetId.toString());
      if (post) {
        authorId = post.author._id.toString();
      }
      targetRestored = await this.postRepository.restore(targetId.toString());
      if (!targetRestored) {
        throw new NotFoundException(
          'Post not found or already permanently deleted. Cannot restore.',
        );
      }
    } else if (targetType === ReportTargetType.COMMENT) {
      const comment = await this.commentRepository.findById(
        targetId.toString(),
      );
      if (comment) {
        authorId = comment.author._id.toString();
      }
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

    if (authorId) {
      await this.createNotificationService.execute({
        receiver: authorId,
        type: NotificationType.CONTENT_RESTORED,
        relatedId: reportId,
        relatedModel: 'Report',
        message: 'Nội dung của bạn đã được khôi phục',
        metadata: {
          targetType,
          targetId: targetId.toString(),
        },
      });
    }

    return {
      success: true,
      message: `Successfully reversed decision. Restored ${targetType} and updated ${totalReportsReversed} report(s) to 'rejected'.`,
      targetRestored,
      totalReportsReversed,
    };
  }
}
