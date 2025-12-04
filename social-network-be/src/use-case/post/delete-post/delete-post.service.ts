import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from 'src/domains/post/post.repository';

@Injectable()
export class DeletePostService {
  constructor(private readonly postRepository: PostRepository) {}

  async execute({
    postId,
    userId,
  }: {
    postId: string;
    userId: string;
  }): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author._id.toString() !== userId) {
      throw new ForbiddenException('You are not the author of this post');
    }

    await this.postRepository.softDelete(postId);
  }
}
