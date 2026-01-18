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

export type ResolveAppealInput = {
  reportId: string;
  adminId: string;
  accepted: boolean;
  adminNote?: string;
};

export type ResolveAppealOutput = {
  success: boolean;
  message: string;
  contentRestored: boolean;
};

@Injectable()
export class ResolveAppealService extends BaseUseCaseService<
  ResolveAppealInput,
  ResolveAppealOutput
> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly createNotificationService: CreateNotificationService,
  ) {
    super();
  }

  async execute(input: ResolveAppealInput): Promise<ResolveAppealOutput> {
    const { reportId, adminId, accepted, adminNote } = input;

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.APPEALED) {
      throw new BadRequestException('Only appealed reports can be resolved');
    }

    let contentRestored = false;
    let authorId: string | null = null;

    if (report.targetType === ReportTargetType.POST) {
      const post = await this.postRepository.findLeanedById<{
        author: { _id: any };
      }>(report.targetId.toString());
      if (post) {
        authorId = post.author._id.toString();
      }

      if (accepted) {
        await this.postRepository.restore(report.targetId.toString());
        contentRestored = true;
      }
    } else if (report.targetType === ReportTargetType.COMMENT) {
      const comment = await this.commentRepository.findById(
        report.targetId.toString(),
      );
      if (comment) {
        authorId = comment.author._id.toString();
      }

      if (accepted) {
        await this.commentRepository.restore(report.targetId.toString());
        contentRestored = true;
      }
    }

    await this.reportRepository.resolveAppeal(
      reportId,
      accepted,
      adminId,
      adminNote,
    );

    if (authorId) {
      const message = accepted
        ? 'Kháng nghị của bạn đã được chấp nhận. Nội dung đã được khôi phục.'
        : 'Kháng nghị của bạn đã bị từ chối. Quyết định ban đầu được giữ nguyên.';

      await this.createNotificationService.execute({
        receiver: authorId,
        type: accepted
          ? NotificationType.CONTENT_RESTORED
          : NotificationType.CONTENT_REMOVED_VIOLATION,
        relatedId: reportId,
        relatedModel: 'Report',
        message,
        metadata: {
          appealResult: accepted ? 'accepted' : 'rejected',
          targetType: report.targetType,
        },
      });
    }

    return {
      success: true,
      message: accepted
        ? 'Appeal accepted. Content restored.'
        : 'Appeal rejected. Decision maintained.',
      contentRestored,
    };
  }
}
