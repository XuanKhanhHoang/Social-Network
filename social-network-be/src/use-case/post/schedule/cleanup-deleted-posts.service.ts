import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { PostRepository } from 'src/domains/post/post.repository';

@Injectable()
export class CleanupDeletedPostsService {
  private readonly logger = new Logger(CleanupDeletedPostsService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly mediaUploadService: MediaUploadService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running cleanup for expired deleted posts...');

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    const expiredPosts =
      await this.postRepository.findExpiredDeletedPosts(thresholdDate);

    if (expiredPosts.length === 0) {
      this.logger.log('No expired posts found.');
      return;
    }

    const mediaIds: string[] = [];
    expiredPosts.forEach((post) => {
      if (post.media && post.media.length > 0) {
        post.media.forEach((m) => {
          if (m.mediaId) {
            mediaIds.push(m.mediaId.toString());
          }
        });
      }
    });

    if (mediaIds.length > 0) {
      await this.mediaUploadService.forceDeleteMediaList(mediaIds);
    }
    const postIds = expiredPosts.map((post) => post._id.toString());
    await this.postRepository.hardDeletePosts(postIds);

    this.logger.log(
      `Cleanup complete. Deleted ${postIds.length} posts and ${mediaIds.length} media files.`,
    );
  }
}
