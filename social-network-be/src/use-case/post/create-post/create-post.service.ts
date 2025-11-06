import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MediaBasicDataWithCaption } from 'src/domains/media-upload/interfaces/type';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { CreatePostData } from 'src/domains/post/interfaces/post.type';
import { PostRepository } from 'src/domains/post/post.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { PostDocument } from 'src/schemas';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { MediaType, UserPrivacy } from 'src/share/enums';
import { PostEvents } from 'src/share/events';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

type CreatePostServiceInput = {
  userId: string;
  data: {
    content?: TiptapDocument;
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
  constructor(
    private readonly postRepository: PostRepository,
    private readonly mediaUploadService: MediaUploadService,
    private readonly userRepository: UserRepository,
    private emitter: EventEmitter2,
  ) {
    super();
  }
  private logger = new Logger(CreatePostService.name);

  async execute(input: CreatePostServiceInput): Promise<PostDocument> {
    const { userId, data } = input;
    let media: MediaBasicDataWithCaption<string>[] = [];
    const [author, mediaItems] = await Promise.all([
      this.userRepository.findByIdBasic(userId),
      this.mediaUploadService.findMedia(
        data.media?.map((m) => m.mediaId) || [],
      ),
    ]);
    if (mediaItems && mediaItems.length > 0) {
      const mediaData = data.media?.map((item, index) => ({
        mediaId: item.mediaId,
        caption: item.caption || '',
        order: item.order || index,
      }));
      const mediaDataMap = new Map(
        mediaData.map((item) => [item.mediaId, item]),
      );
      media = mediaItems.map((item) => {
        const mediaData = mediaDataMap.get(item._id as string);
        return {
          mediaId: mediaData?.mediaId || (item._id as string),
          caption: mediaData?.caption || '',
          order: mediaData?.order || 0,
          url: item.url,
          mediaType: item.mediaType as MediaType,
        };
      });
    }

    if (mediaItems.length == 0 && !data.content)
      throw new BadRequestException();

    const newData: CreatePostData = {
      author,
      media,
      content: data.content,
      visibility: data.visibility,
      backgroundValue: data.backgroundValue,
    };
    try {
      const newPost = await this.postRepository.create(newData);
      this.emitter.emit(PostEvents.created, {
        targetId: newPost._id,
        authorId: newData.author,
      });
      await this.mediaUploadService.confirmUploads(
        newData.media.map((m) => m.mediaId),
        userId,
      );
      return newPost;
    } catch (error) {
      this.logger.error(
        `Failed to create post for user ${newData.author}: ${error.message}`,
        error.stack,
      );

      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid post data: ' + error.message);
      }

      throw new BadRequestException('Failed to create post');
    }
  }
}
