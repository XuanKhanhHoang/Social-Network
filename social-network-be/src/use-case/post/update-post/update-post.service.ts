import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection } from '@nestjs/mongoose';
import { MediaType } from 'express';
import { ClientSession, Connection, UpdateQuery } from 'mongoose';
import {
  MediaBasicDataWithCaption,
  MediaUpload,
} from 'src/domains/media-upload/interfaces/type';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { Post } from 'src/domains/post/interfaces/post.type';
import { PostRepository } from 'src/domains/post/post.repository';

import { PostDocument } from 'src/schemas';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { UserPrivacy } from 'src/share/enums';
import { PostEvents } from 'src/share/events';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

interface UpdatePostInput {
  userId: string;
  postId: string;
  data: {
    content?: TiptapDocument;
    backgroundValue?: string;
    media?:
      | { mediaId: string; caption?: string; order?: number }[]
      | undefined
      | null;
    visibility?: UserPrivacy;
  };
}
interface UpdatePostOutput extends Post {}
@Injectable()
export class UpdatePostService extends BaseUseCaseService<
  UpdatePostInput,
  Post
> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly postRepository: PostRepository,
    private readonly mediaUploadService: MediaUploadService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }
  private readonly logger = new Logger(UpdatePostService.name);
  async execute(input: UpdatePostInput): Promise<Post> {
    const session = await this.connection.startSession();

    try {
      const { postId, userId, data } = input;
      const result = await session.withTransaction(async () => {
        const post = await this.validateOwnership(postId, userId, session);
        if (post.author._id.toString() != userId)
          throw new ForbiddenException(
            'You are not allowed to update this post',
          );

        const { mediaToDelete } = this.calculateMediaChanges(post, data?.media);

        let deletedMedias = [];
        if (mediaToDelete.length > 0)
          deletedMedias = await this.mediaUploadService.batchDeleteFromDb(
            mediaToDelete.map((m) => m?.mediaId),
            session,
          );

        const updateData: UpdateQuery<Post> = {
          $set: {
            updatedAt: new Date(),
          },
        };
        if (Array.isArray(data?.media)) {
          const mediaDataMap = new Map(
            data?.media.map((item) => [item.mediaId, item]),
          );
          const mediaItems = await this.mediaUploadService.findMedia(
            data.media.map((m) => m.mediaId),
          );
          if (mediaItems.length !== data.media.length)
            throw new NotFoundException('Some media not found');

          updateData.$set.media = mediaItems.map((item) => {
            const mediaData = mediaDataMap.get(item._id as string);
            return {
              mediaId: mediaData?.mediaId || (item._id as string),
              caption: mediaData?.caption || '',
              order: mediaData?.order || 0,
              url: item.url,
              mediaType: item.mediaType as unknown as MediaType,
            };
          });
        }

        if (data.content) {
          updateData.$set.content = data.content;
        }
        if (data.visibility) {
          updateData.$set.visibility = data.visibility;
        }
        if (data.backgroundValue) {
          updateData.$set.backgroundValue = data.backgroundValue;
        }

        const updatedPost = await this.postRepository.updateByIdAndGet(
          postId,
          updateData,
          session,
        );

        if (!updatedPost) {
          throw new NotFoundException('Post not found');
        }

        return { updatedPost, deletedMedias };
      });

      this.scheduleCloudCleanup(result.deletedMedias);

      this.eventEmitter.emit(PostEvents.updated, {
        targetId: result.updatedPost._id,
        authorId: input.userId,
      });

      return result.updatedPost.toObject();
    } finally {
      await session.endSession();
    }
  }
  private calculateMediaChanges(
    post: Post | PostDocument,
    mediaInUse:
      | { mediaId: string; caption?: string; order?: number }[]
      | undefined
      | null,
  ): {
    mediaToDelete: MediaBasicDataWithCaption<string>[];
  } {
    if (mediaInUse == undefined)
      return {
        mediaToDelete: [],
      };
    const currentMediaIds = post.media?.map((m) => m.mediaId.toString()) || [];
    if (mediaInUse == null)
      return {
        mediaToDelete: currentMediaIds,
      };
    const newMediaIds = new Set(mediaInUse.map((m) => m.mediaId));

    const mediaToDelete = currentMediaIds.filter((id) => !newMediaIds.has(id));

    return {
      mediaToDelete,
    };
  }

  private async scheduleCloudCleanup(
    deletedMedias: MediaUpload[],
  ): Promise<void> {
    if (deletedMedias.length === 0) return;

    await this.mediaUploadService
      .batchDeleteFromCloud(deletedMedias)
      .catch((error) => {
        this.logger.error('Unexpected error in cloud cleanup', error);
      });
  }
  async validateOwnership(
    postId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<PostDocument> {
    const post = await this.postRepository.findById(postId, session);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    return post;
  }
}
