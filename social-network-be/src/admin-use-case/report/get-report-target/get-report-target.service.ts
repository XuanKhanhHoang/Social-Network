import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReportRepository } from 'src/domains/report/report.repository';
import { ReportTargetType } from 'src/schemas/report.schema';
import { PostDocument, CommentDocument } from 'src/schemas';

export type GetReportTargetInput = {
  reportId: string;
};

export type ReportTargetAuthor = {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

export type ReportTargetMedia = {
  url: string;
  mediaType: string;
  caption?: string;
};

export type ReportTargetOutput = {
  targetType: ReportTargetType;
  targetId: string;
  content: any;
  author: ReportTargetAuthor;
  createdAt: Date;
  media?: ReportTargetMedia[];
  isDeleted: boolean;
};

@Injectable()
export class GetReportTargetService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(input: GetReportTargetInput): Promise<ReportTargetOutput> {
    const report = await this.reportRepository.findById(input.reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const targetId = report.targetId.toString();

    if (report.targetType === ReportTargetType.POST) {
      return this.getPostTarget(targetId);
    } else {
      return this.getCommentTarget(targetId);
    }
  }

  private async getPostTarget(postId: string): Promise<ReportTargetOutput> {
    const post = await this.postRepository.findLeanedById<PostDocument>(postId);

    if (!post) {
      return {
        targetType: ReportTargetType.POST,
        targetId: postId,
        content: null,
        author: {
          _id: '',
          username: '',
          firstName: 'Đã xóa',
          lastName: '',
        },
        createdAt: new Date(),
        isDeleted: true,
      };
    }

    return {
      targetType: ReportTargetType.POST,
      targetId: postId,
      content: post.content,
      author: {
        _id: post.author._id.toString(),
        username: post.author.username,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        avatar: post.author.avatar,
      },
      createdAt: post.createdAt,
      media: post.media?.map((m) => ({
        url: m.url,
        mediaType: m.mediaType,
        caption: m.caption,
      })),
      isDeleted: false,
    };
  }

  private async getCommentTarget(
    commentId: string,
  ): Promise<ReportTargetOutput> {
    const comment =
      await this.commentRepository.findById<CommentDocument>(commentId);

    if (!comment) {
      return {
        targetType: ReportTargetType.COMMENT,
        targetId: commentId,
        content: null,
        author: {
          _id: '',
          username: '',
          firstName: 'Đã xóa',
          lastName: '',
        },
        createdAt: new Date(),
        isDeleted: true,
      };
    }

    return {
      targetType: ReportTargetType.COMMENT,
      targetId: commentId,
      content: comment.content,
      author: {
        _id: comment.author._id.toString(),
        username: comment.author.username,
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
        avatar: comment.author.avatar,
      },
      createdAt: comment.createAt,
      media: comment.media
        ? [{ url: comment.media.url, mediaType: comment.media.mediaType }]
        : undefined,
      isDeleted: false,
    };
  }
}
