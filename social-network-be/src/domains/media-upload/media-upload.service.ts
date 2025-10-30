import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaType } from 'src/share/enums';
import { MediaUploadDocument } from 'src/schemas';
import { MediaUpload } from './interfaces/type';

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);

  constructor(
    @Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinary,
    @InjectModel(MediaUploadDocument.name)
    private mediaModel: Model<MediaUploadDocument>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupExpiredMedia() {
    const expiredMedia = await this.mediaModel.find({
      isConfirmed: false,
      expiresAt: { $lt: new Date() },
    });

    for (const media of expiredMedia) {
      await this.deleteMediaOnAllNotSafe(media);
    }

    if (expiredMedia.length > 0) {
      console.log(`Cleaned up ${expiredMedia.length} expired media files`);
    }
  }

  async uploadTemporary(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    id: string;
    url: string;
    mediaType: string;
    message: string;
    expiresAt: Date;
  }> {
    const mediaType = this.detectMediaType(file.mimetype);
    const maxSize =
      mediaType === 'image'
        ? 10 * 1024 * 1024 // 10MB
        : 200 * 1024 * 1024; // 200MB

    if (file.size > maxSize) {
      throw new BadRequestException(
        mediaType === 'image'
          ? 'Max size of image is 10MB'
          : 'Max size of video is 200MB',
      );
    }
    try {
      const tempMediaUploadFolder = 'temp_uploads';
      const uploadResult = await this.cloudinaryInstance.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          resource_type: mediaType === 'video' ? 'video' : 'image',
          folder: tempMediaUploadFolder,
          public_id: `temp_${mediaType}_${Date.now()}_${userId}`,
          ...(mediaType === 'image' && {
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
            ],
          }),
          ...(mediaType === 'video' && {
            transformation: [{ quality: 'auto', width: 1280, crop: 'limit' }],
          }),
        },
      );

      const tempMedia = new this.mediaModel({
        cloudinaryPublicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        originalFilename: file.originalname,
        mediaType,
        userId,
      });
      const savedMedia = await tempMedia.save();

      return {
        id: savedMedia._id.toString(),
        url: uploadResult.secure_url,
        mediaType,
        expiresAt: savedMedia.expiresAt,
        message: `Upload successfully. Media will expire after 15 minutes if not confirmed.`,
      };
    } catch (error) {
      this.logger.error('Upload failed:', error);
      throw new BadRequestException('Upload error, please try again.');
    }
  }

  async confirmUpload(
    mediaId: string,
    userId: string,
  ): Promise<{
    id: string;
    url: string;
    publicId: string;
    mediaType: string;
    message: string;
  }> {
    const tempMedia = await this.mediaModel.findOne({
      _id: new Types.ObjectId(String(mediaId).trim()),
      userId,
      isConfirmed: false,
    });

    if (!tempMedia) {
      throw new NotFoundException('Media not found or already confirmed');
    }

    if (new Date() > tempMedia.expiresAt) {
      throw new BadRequestException('Media is expired');
    }

    try {
      const newPublicId = tempMedia.cloudinaryPublicId.replace(
        'temp_uploads/',
        'confirmed/',
      );

      const moveResult = await this.cloudinaryInstance.uploader.rename(
        tempMedia.cloudinaryPublicId,
        newPublicId,
        {
          resource_type: tempMedia.mediaType === 'video' ? 'video' : 'image',
        },
      );

      tempMedia.isConfirmed = true;
      tempMedia.cloudinaryPublicId = newPublicId;
      tempMedia.url = moveResult.secure_url;
      await tempMedia.save();

      return {
        id: tempMedia._id.toString(),
        url: moveResult.secure_url,
        publicId: newPublicId,
        mediaType: tempMedia.mediaType,
        message: 'Media is confirmed and moved to permanent storage',
      };
    } catch (error) {
      this.logger.error('Confirm upload failed:', error);
      throw new BadRequestException(
        'Media confirmation failed, please try again.',
      );
    }
  }

  async cancelUpload(
    mediaId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const media = await this.mediaModel.findOne({
      _id: mediaId,
      userId,
      isConfirmed: false,
    });

    if (!media) {
      return { message: 'Media not found or already confirmed, skipped' };
    }

    try {
      await this.mediaModel.deleteOne({ _id: media._id, userId });

      try {
        await this.deleteFromCloud(
          media.cloudinaryPublicId,
          media.mediaType as MediaType,
        );
      } catch (cloudErr) {
        console.error(
          `Failed to delete media file from cloud: ${mediaId}`,
          cloudErr,
        );
        return {
          message: 'Media removed from DB, cloud cleanup failed (logged)',
        };
      }

      return { message: 'Media deleted successfully' };
    } catch (dbErr) {
      throw new Error(`Failed to delete media from DB: ${dbErr.message}`);
    }
  }
  public async deleteFromDb(
    mediaId: string,
    session?: ClientSession,
  ): Promise<any> {
    const media = await this.mediaModel
      .findOne(
        {
          _id: mediaId,
          isConfirmed: false,
        },
        null,
        { session },
      )
      .lean();

    if (!media) {
      return { message: 'Media not found or already confirmed, skipped' };
    }

    await this.mediaModel.deleteOne({ _id: media._id }, { session });
    return media;
  }
  public async deleteFromCloud(
    mediaCloudinaryPublicId: string,
    mediaType: MediaType,
  ) {
    try {
      await this.cloudinaryInstance.uploader.destroy(mediaCloudinaryPublicId, {
        resource_type:
          mediaType === MediaType.VIDEO ? MediaType.VIDEO : MediaType.IMAGE,
      });

      return true;
    } catch (err) {
      this.logger.error(
        `Failed to delete media ${mediaCloudinaryPublicId} from Cloud`,
        err,
      );
      return false;
    }
  }
  private async deleteMediaOnAllNotSafe(
    media: MediaUpload | MediaUploadDocument,
  ) {
    try {
      await this.deleteFromDb(media._id.toString());

      try {
        await this.deleteFromCloud(
          media.cloudinaryPublicId,
          media.mediaType as MediaType,
        );
      } catch (cloudErr) {
        this.logger.error(
          `Deleted from DB but failed to delete from Cloud: cloudId: ${media.cloudinaryPublicId} , mediaId: ${media._id}`,
          cloudErr,
        );
      }
      this.logger.log(`Deleted media: ${media.cloudinaryPublicId}`);
    } catch (error) {
      this.logger.error('Failed to delete media from DB:', error);
      throw error;
    }
  }
  async batchDeleteFromDb(
    mediaIds: string[],
    session?: ClientSession,
  ): Promise<MediaUpload[]> {
    if (mediaIds.length === 0) return [];

    const deletedMedias: MediaUpload[] = [];

    for (const mediaId of mediaIds) {
      const media = (await this.deleteFromDb(
        mediaId,
        session,
      )) as unknown as MediaUpload;
      if (media) {
        deletedMedias.push(media);
      }
    }

    return deletedMedias;
  }
  async batchDeleteFromCloud(medias: MediaUpload[]): Promise<void> {
    if (medias.length === 0) return;

    const results = await Promise.allSettled(
      medias.map((m) =>
        this.deleteFromCloud(m.cloudinaryPublicId, m.mediaType as MediaType),
      ),
    );
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to delete media ${medias[index]._id} from cloud: ${result.reason}`,
        );
      }
    });
  }

  private detectMediaType(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    throw new BadRequestException('Unsupported media type');
  }
}
