import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { PostDocument } from 'src/schemas/post.schema';
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
  plain_text: string;
  visibility: string;
  status: string;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  deletedAt?: Date;
};

export type GetPostsOutput = PaginatedResponse<PostListItem>;

@Injectable()
export class GetPostsService extends BaseUseCaseService<
  GetPostsInput,
  GetPostsOutput
> {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<PostDocument>,
  ) {
    super();
  }

  async execute(input: GetPostsInput): Promise<GetPostsOutput> {
    const { page, limit, searchId, includeDeleted } = input;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<PostDocument> = {};

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    if (searchId) {
      filter._id = new Types.ObjectId(searchId);
    }

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .select(
          '_id author content plain_text visibility status reactionsCount commentsCount sharesCount createdAt deletedAt',
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.postModel.countDocuments(filter),
    ]);

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
        plain_text: post.plain_text,
        visibility: post.visibility,
        status: post.status,
        reactionsCount: post.reactionsCount,
        commentsCount: post.commentsCount,
        sharesCount: post.sharesCount,
        createdAt: post.createdAt,
        deletedAt: post.deletedAt,
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
