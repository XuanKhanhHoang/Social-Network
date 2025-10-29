import { Injectable } from '@nestjs/common';
import { CreatePostData } from 'src/domains/post/interfaces/post.type';
import { PostService } from 'src/domains/post/post.service';
import { PostDocument } from 'src/schemas';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { UserPrivacy } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type CreatePostServiceInput = {
  userId: string;
  data: {
    content: TiptapDocument;
    backgroundValue?: string;
    media?: { mediaId: string; caption?: string; order?: number }[];
    visibility?: UserPrivacy;
  };
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
      mediaId: item.mediaId,
      caption: item.caption || '',
      order: item.order || index,
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
