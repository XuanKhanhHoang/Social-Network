import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PostWithMyReactionModel } from 'src/domains/post/interfaces';
import { PostRepository } from 'src/domains/post/post.repository';
import { UserPrivacy } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

interface GetPostFullInput {
  postId: string;
  userId: string;
}
export interface GetPostFullOutput
  extends PostWithMyReactionModel<Types.ObjectId> {}
@Injectable()
export class GetPostFullService extends BaseUseCaseService<
  GetPostFullInput,
  GetPostFullOutput
> {
  constructor(private readonly postRepository: PostRepository) {
    super();
  }
  private logger = new Logger(GetPostFullService.name);

  async execute(input: GetPostFullInput): Promise<GetPostFullOutput> {
    const { postId, userId } = input;
    try {
      const post = await this.postRepository.findFullPostById(postId, userId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.visibility === UserPrivacy.PRIVATE) {
        if (post.author.toString() !== userId) {
          throw new ForbiddenException('You are not allowed to view this post');
        }
      }

      return post;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to get post ${postId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve post');
    }
  }
}
