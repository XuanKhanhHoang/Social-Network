import { Injectable } from '@nestjs/common';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { PaginatedResponse } from 'src/share/dto/pagination.dto';

export type GetCommentsInput = {
  page: number;
  limit: number;
  searchId?: string;
  postId?: string;
  includeDeleted?: boolean;
};

export type CommentListItem = {
  _id: string;
  postId: string;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: any;
  };
  content: Record<string, any>;
  parentId?: string;
  rootId?: string;
  mentionedUser?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  reactionsCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type GetCommentsOutput = PaginatedResponse<CommentListItem>;

@Injectable()
export class GetCommentsService extends BaseUseCaseService<
  GetCommentsInput,
  GetCommentsOutput
> {
  constructor(private readonly commentRepository: CommentRepository) {
    super();
  }

  async execute(input: GetCommentsInput): Promise<GetCommentsOutput> {
    const { page, limit, searchId, postId, includeDeleted } = input;

    const { data: comments, total } = await this.commentRepository.findForAdmin(
      {
        page,
        limit,
        searchId,
        postId,
        includeDeleted,
      },
    );

    return {
      data: comments.map((comment) => ({
        _id: comment._id.toString(),
        postId: comment.postId.toString(),
        author: {
          _id: comment.author._id.toString(),
          username: comment.author.username,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
          avatar: comment.author.avatar,
        },
        content: comment.content,
        parentId: comment.parentId?.toString(),
        rootId: comment.rootId?.toString(),
        mentionedUser: comment.mentionedUser
          ? {
              _id: comment.mentionedUser._id.toString(),
              username: comment.mentionedUser.username,
              firstName: comment.mentionedUser.firstName,
              lastName: comment.mentionedUser.lastName,
            }
          : undefined,
        reactionsCount: comment.reactionsCount,
        repliesCount: comment.repliesCount,
        createdAt: (comment as any).createdAt,
        updatedAt: (comment as any).updatedAt,
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
