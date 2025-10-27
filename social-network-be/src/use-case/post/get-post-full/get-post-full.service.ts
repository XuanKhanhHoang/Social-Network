import { Injectable } from '@nestjs/common';
import { Post } from 'src/domains/post/interfaces/post.type';
import { PostService } from 'src/domains/post/post.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export class GetPostFullInput {
  postId: string;
  userId: string;
}
@Injectable()
export class GetPostFullService extends BaseUseCaseService<
  GetPostFullInput,
  Post
> {
  constructor(private readonly postService: PostService) {
    super();
  }

  async execute(input: GetPostFullInput): Promise<Post> {
    return this.postService.getPostById(input.postId, input.userId);
  }
}
