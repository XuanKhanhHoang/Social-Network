import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReportStatus, ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

const APPEAL_WINDOW_DAYS = 15;

export type SubmitAppealInput = {
  reportId: string;
  userId: string;
  reason: string;
};

export type SubmitAppealOutput = {
  success: boolean;
  message: string;
};

@Injectable()
export class SubmitAppealService extends BaseUseCaseService<
  SubmitAppealInput,
  SubmitAppealOutput
> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {
    super();
  }

  async execute(input: SubmitAppealInput): Promise<SubmitAppealOutput> {
    const { reportId, userId, reason } = input;

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.RESOLVED) {
      throw new BadRequestException('Only resolved reports can be appealed');
    }

    if (report.hasAppealed) {
      throw new BadRequestException('This report has already been appealed');
    }

    if (report.reviewedAt) {
      const daysSinceReview = Math.floor(
        (Date.now() - report.reviewedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceReview > APPEAL_WINDOW_DAYS) {
        throw new BadRequestException(
          `Appeal window has expired (${APPEAL_WINDOW_DAYS} days)`,
        );
      }
    }

    let authorId: string | null = null;

    if (report.targetType === ReportTargetType.POST) {
      const post = await this.postRepository.findLeanedById<{
        author: { _id: any };
      }>(report.targetId.toString());
      if (post) {
        authorId = post.author._id.toString();
      }
    } else if (report.targetType === ReportTargetType.COMMENT) {
      const comment = await this.commentRepository.findById(
        report.targetId.toString(),
      );
      if (comment) {
        authorId = comment.author._id.toString();
      }
    }

    if (authorId !== userId) {
      throw new ForbiddenException(
        'Only the content author can submit an appeal',
      );
    }

    await this.reportRepository.submitAppeal(reportId, reason);

    return {
      success: true,
      message: 'Appeal submitted successfully',
    };
  }
}
