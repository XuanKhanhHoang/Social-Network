import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from 'src/domains/post/post.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type AdminRestorePostInput = {
  postId: string;
};

export type AdminRestorePostOutput = {
  success: boolean;
  message: string;
};

@Injectable()
export class AdminRestorePostService extends BaseUseCaseService<
  AdminRestorePostInput,
  AdminRestorePostOutput
> {
  constructor(private readonly postRepository: PostRepository) {
    super();
  }

  async execute(input: AdminRestorePostInput): Promise<AdminRestorePostOutput> {
    const { postId } = input;

    const restored = await this.postRepository.restore(postId);

    if (!restored) {
      throw new NotFoundException('Post not found or already restored');
    }

    return {
      success: true,
      message: 'Post restored successfully',
    };
  }
}
