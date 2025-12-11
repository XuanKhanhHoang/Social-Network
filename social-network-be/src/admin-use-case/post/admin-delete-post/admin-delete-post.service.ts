import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from 'src/domains/post/post.repository';
import { ReportRepository } from 'src/domains/report/report.repository';
import { ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type AdminDeletePostInput = {
  postId: string;
  adminId: string;
};

export type AdminDeletePostOutput = {
  success: boolean;
  message: string;
  totalReportsResolved: number;
};

@Injectable()
export class AdminDeletePostService extends BaseUseCaseService<
  AdminDeletePostInput,
  AdminDeletePostOutput
> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly reportRepository: ReportRepository,
  ) {
    super();
  }

  async execute(input: AdminDeletePostInput): Promise<AdminDeletePostOutput> {
    const { postId, adminId } = input;

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.softDelete(postId);

    const totalReportsResolved =
      await this.reportRepository.resolveAllForTarget(
        ReportTargetType.POST,
        postId,
        adminId,
        'Đã xóa bài viết từ trang quản lý',
      );

    return {
      success: true,
      message: `Post deleted ${totalReportsResolved > 0 ? ` and resolved ${totalReportsResolved} reports` : ''}`,
      totalReportsResolved,
    };
  }
}
