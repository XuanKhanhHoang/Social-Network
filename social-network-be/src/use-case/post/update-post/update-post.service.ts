import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Post, UpdatePostInput } from 'src/domains/post/interfaces/post.type';
import { PostService } from 'src/domains/post/post.service';
import {
  MediaUpload,
  MediaUploadService,
} from 'src/media-upload/media-upload.service';
import { PostDocument } from 'src/schemas';
import { PostEvents } from 'src/share/events';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

@Injectable()
export class UpdatePostService extends BaseUseCaseService<
  UpdatePostInput,
  Post
> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly postService: PostService,
    private readonly mediaUploadService: MediaUploadService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger = new Logger(UpdatePostService.name),
  ) {
    super();
  }
  async execute(input: UpdatePostInput): Promise<Post> {
    const session = await this.connection.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const post = await this.postService.validateOwnership(
          input.postId,
          input.userId,
          session,
        );

        const { mediaToDelete, mediaToKeep } = this.calculateMediaChanges(
          post,
          input.media || [],
        );

        const deletedMedias = await this.mediaUploadService.batchDeleteFromDb(
          mediaToDelete,
          session,
        );

        const updatedPost = await this.postService.updatePost(
          {
            content: input.content,
            visibility: input.visibility,
            backgroundValue: input.backgroundValue,
            media: mediaToKeep,
            postId: input.postId,
          },
          session,
        );

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
    mediaInUse: Array<{ mediaId: string; caption?: string; order: number }>,
  ): {
    mediaToDelete: string[];
    mediaToKeep: Array<{ mediaId: string; caption?: string; order: number }>;
  } {
    const currentMediaIds = this.postService.getMediaIds(post);
    const newMediaIds = new Set(mediaInUse.map((m) => m.mediaId));

    const mediaToDelete = currentMediaIds.filter((id) => !newMediaIds.has(id));

    return {
      mediaToDelete,
      mediaToKeep: mediaInUse,
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
}
