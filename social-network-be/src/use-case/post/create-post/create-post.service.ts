import { Injectable } from '@nestjs/common';
import { CreatePostData } from 'src/domains/post/interfaces/post.type';
import { PostService } from 'src/domains/post/post.service';
import { CreatePostDto } from 'src/post/dto/req/create-post.dto';
import { PostDocument } from 'src/schemas';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type CreatePostServiceInput = {
  userId: string;
  data: CreatePostDto;
};
@Injectable()
export class CreatePostService extends BaseUseCaseService<
  CreatePostServiceInput,
  PostDocument
> {
  constructor(private readonly postService: PostService) {
    super();
  }
  execute(input: CreatePostServiceInput): Promise<PostDocument> {
    const { userId, data } = input;
    const media = data.media?.map((item, index) => ({
      mediaId: item.id,
      caption: item.caption || '',
      order: index,
    }));
    const newData: CreatePostData = {
      author: userId,
      content: data.content,
      media,
      visibility: data.visibility,
      backgroundValue: data.backgroundValue,
    };
    return this.postService.createPost(newData);
  }
}
