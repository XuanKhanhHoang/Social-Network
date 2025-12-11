import { Injectable } from '@nestjs/common';
import { PostRepository } from 'src/domains/post/post.repository';
import { ReportRepository } from 'src/domains/report/report.repository';
import { ReportTargetType } from 'src/schemas/report.schema';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { PaginatedResponse } from 'src/share/dto/pagination.dto';

export type GetPostsInput = {
  page: number;
  limit: number;
  searchId?: string;
  includeDeleted?: boolean;
};

export type PostListItem = {
  _id: string;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: any;
  };
  content: Record<string, any>;
  media?: { url: string; mediaType: string; caption?: string }[];
  plain_text: string;
  visibility: string;
  status: string;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  deletedAt?: Date;
  pendingReportsCount: number;
};

export type GetPostsOutput = PaginatedResponse<PostListItem>;

@Injectable()
export class GetPostsService extends BaseUseCaseService<
  GetPostsInput,
  GetPostsOutput
> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly reportRepository: ReportRepository,
  ) {
    super();
  }

  async execute(input: GetPostsInput): Promise<GetPostsOutput> {
    const { page, limit, searchId, includeDeleted } = input;

    const { data: posts, total } = await this.postRepository.findForAdmin({
      page,
      limit,
      searchId,
      includeDeleted,
    });

    const postIds = posts.map((p) => p._id.toString());
    const pendingCountMap = await this.reportRepository.countPendingForTargets(
      ReportTargetType.POST,
      postIds,
    );

    return {
      data: posts.map((post) => ({
        _id: post._id.toString(),
        author: {
          _id: post.author._id.toString(),
          username: post.author.username,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          avatar: post.author.avatar,
        },
        content: post.content,
        media: post.media?.map((m) => ({
          url: m.url,
          mediaType: m.mediaType,
          caption: m.caption,
        })),
        plain_text: post.plain_text,
        visibility: post.visibility,
        status: post.status,
        reactionsCount: post.reactionsCount,
        commentsCount: post.commentsCount,
        sharesCount: post.sharesCount,
        createdAt: post.createdAt,
        deletedAt: post.deletedAt,
        pendingReportsCount: pendingCountMap.get(post._id.toString()) || 0,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
