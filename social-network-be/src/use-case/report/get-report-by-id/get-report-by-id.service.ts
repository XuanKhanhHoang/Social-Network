import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ReportRepository } from 'src/domains/report/report.repository';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type GetReportByIdInput = {
  reportId: string;
  userId: string;
};

export type GetReportByIdOutput = {
  _id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: string;
  createdAt: Date;
  reviewedAt?: Date;
  hasAppealed?: boolean;
  appealReason?: string;
  appealedAt?: Date;
  content?: {
    text?: any;
    mediaUrl?: string;
  };
};

@Injectable()
export class GetReportByIdService extends BaseUseCaseService<
  GetReportByIdInput,
  GetReportByIdOutput
> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {
    super();
  }

  async execute(input: GetReportByIdInput): Promise<GetReportByIdOutput> {
    const { reportId, userId } = input;

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    let authorId: string | null = null;
    let content: { text?: any; mediaUrl?: string } | undefined;

    if (report.targetType === ReportTargetType.POST) {
      const post = await this.postRepository.findLeanedById<{
        author: { _id: any };
        content?: string;
        media?: { url: string }[];
      }>(report.targetId.toString());
      if (post) {
        authorId = post.author._id.toString();
        content = {
          text: post.content,
          mediaUrl: post.media?.[0]?.url,
        };
      }
    } else if (report.targetType === ReportTargetType.COMMENT) {
      const comment = await this.commentRepository.findById(
        report.targetId.toString(),
      );
      if (comment) {
        authorId = comment.author._id.toString();
        content = {
          text: comment.content,
        };
      }
    }

    if (authorId !== userId) {
      throw new ForbiddenException('You can only view your own violations');
    }

    return {
      _id: report._id.toString(),
      targetType: report.targetType,
      targetId: report.targetId.toString(),
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt,
      reviewedAt: report.reviewedAt,
      hasAppealed: report.hasAppealed,
      appealReason: report.appealReason,
      appealedAt: report.appealedAt,
      content,
    };
  }
}
