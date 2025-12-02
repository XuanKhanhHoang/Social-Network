import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { ChatRepository } from 'src/domains/chat/chat.repository';

@Injectable()
export class CleanupRecalledMessagesService {
  private readonly logger = new Logger(CleanupRecalledMessagesService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly mediaUploadService: MediaUploadService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async execute() {
    this.logger.log('Starting recalled messages cleanup...');

    const messagesToClean = await this.chatRepository.findMessages(
      {
        isRecovered: true,
        mediaUrl: { $ne: null },
      },
      {
        limit: 100,
      },
    );

    if (messagesToClean.length === 0) {
      this.logger.log('No recalled messages with media found.');
      return;
    }

    this.logger.log(`Found ${messagesToClean.length} messages to clean up.`);

    for (const message of messagesToClean) {
      try {
        message.mediaUrl = null;
        message.mediaNonce = null;
        await message.save();

        const match = message.mediaUrl.match(/\/upload\/(?:v\d+\/)?(.*)$/);
        const publicId = match ? match[1] : null;
        this.mediaUploadService.deleteFromCloud(publicId);

        this.logger.log(
          `Cleaned up media ${publicId} for message ${message._id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to clean up media for message ${message._id}`,
          error,
        );
      }
    }
  }
}
