import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';

@Injectable()
export class CleanupDeletedCommentsService {
  private readonly logger = new Logger(CleanupDeletedCommentsService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly mediaUploadService: MediaUploadService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running cleanup for expired deleted comments...');

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    const expiredComments =
      await this.commentRepository.findExpiredDeletedComments(thresholdDate);

    if (expiredComments.length === 0) {
      this.logger.log('No expired comments found.');
      return;
    }

    const mediaIds = expiredComments
      .map((comment) => comment.media?.mediaId?.toString())
      .filter((id): id is string => !!id);

    if (mediaIds.length > 0) {
      await this.mediaUploadService.forceDeleteMediaList(mediaIds);
    }

    const commentIds = expiredComments.map((comment) => comment._id.toString());
    await this.commentRepository.hardDeleteComments(commentIds);

    this.logger.log(
      `Cleanup complete. Deleted ${commentIds.length} comments and ${mediaIds.length} media files.`,
    );
  }
}
