import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaType } from 'src/share/enums';
import { MediaUploadDocument } from 'src/schemas';
import { MediaUpload } from './interfaces/type';
import { PassThrough } from 'stream';

//TODO: Need to split repository and service
@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);

  constructor(
    @Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinary,
    @InjectModel('MediaUpload')
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
  async findMedia(mediaIds: string[]) {
    if (mediaIds.length === 0) return [];
    const mediaIdObjs = mediaIds.map((id) => new Types.ObjectId(id));
    const unorderedMedia = (
      await this.mediaModel.find({ _id: { $in: mediaIdObjs } }).lean()
    ).map((item) => ({ ...item, _id: item._id.toString() }));
    const mediaMap = new Map<string, MediaUploadDocument & { _id: string }>();
    for (const item of unorderedMedia) {
      mediaMap.set(item._id, item as any);
    }
    const orderedMedia = mediaIds
      .map((id) => mediaMap.get(id))
      .filter(
        (item): item is MediaUploadDocument & { _id: string } =>
          item !== undefined,
      );

    return orderedMedia;
  }
  private uploadStream(buffer: Buffer, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinaryInstance.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (result) {
            return resolve(result);
          }
        },
      );

      const bufferStream = new PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(stream);
    });
  }

  async uploadRawStream(file: Express.Multer.File): Promise<string> {
    const uploadResult = await this.uploadStream(file.buffer, {
      resource_type: 'raw',
      folder: 'e2ee_chat',
      public_id: `raw_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });
    return uploadResult.secure_url;
  }

  async uploadTemporary(
    file: Express.Multer.File,
    userId: string,
    width?: number,
    height?: number,
  ): Promise<{
    _id: string;
    url: string;
    mediaType: string;
    expiresAt: Date;
    width?: number;
    height?: number;
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

    const imageTransform = {
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    };

    const videoTransform = {
      transformation: [
        { width: 1280, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    };

    try {
      const uploadFolder = 'uploads';

      const uploadResult = await this.uploadStream(file.buffer, {
        resource_type: mediaType === 'video' ? 'video' : 'image',
        folder: uploadFolder,
        public_id: `${mediaType}_${Date.now()}_${userId}`,
        ...(mediaType === 'image' && imageTransform),
        ...(mediaType === 'video' && videoTransform),
      });

      const tempMedia = new this.mediaModel({
        cloudinaryPublicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        originalFilename: file.originalname,
        mediaType,
        userId,
        width: uploadResult.width,
        height: uploadResult.height,
      });
      const savedMedia = await tempMedia.save();

      return {
        _id: savedMedia._id.toString(),
        url: savedMedia.url,
        mediaType: savedMedia.mediaType,
        expiresAt: savedMedia.expiresAt,
        width: savedMedia.width,
        height: savedMedia.height,
      };
    } catch (error) {
      this.logger.error('Upload failed:', error);
      throw new InternalServerErrorException('Upload error, please try again.');
    }
  }
  async confirmUploads(mediaIds: string[], userId: string): Promise<void> {
    if (!mediaIds || mediaIds.length === 0) {
      return;
    }

    const objectIds = mediaIds.map(
      (id) => new Types.ObjectId(String(id).trim()),
    );

    try {
      const result = await this.mediaModel.updateMany(
        {
          _id: { $in: objectIds },
          userId,
          isConfirmed: false,
        },
        {
          $set: { isConfirmed: true },
          $unset: { expiresAt: '' },
        },
      );

      if (result.matchedCount !== mediaIds.length) {
        this.logger.warn(
          `Potential media confirmation mismatch. Expected ${mediaIds.length}, found ${result.matchedCount}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to confirm media batch: ${mediaIds.join(',')}`,
        error,
      );
    }
  }
  async cancelConfirmUploads(
    mediaIds: string[],
    userId: string,
  ): Promise<void> {
    if (!mediaIds || mediaIds.length === 0) {
      return;
    }

    const objectIds = mediaIds.map(
      (id) => new Types.ObjectId(String(id).trim()),
    );

    try {
      const result = await this.mediaModel.updateMany(
        {
          _id: { $in: objectIds },
          userId,
          isConfirmed: true,
        },
        {
          $set: { isConfirmed: false },
        },
      );

      if (result.matchedCount !== mediaIds.length) {
        this.logger.warn(
          `Potential media confirmation to cancel mismatch. Expected ${mediaIds.length}, found ${result.matchedCount}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to cancel confirm media batch: ${mediaIds.join(',')}`,
        error,
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
    mediaType?: MediaType,
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
  public async deleteFromCloudByMediaId(mediaId: string) {
    try {
      const media = await this.mediaModel.findById(mediaId).lean();
      if (!media) {
        return false;
      }
      const { cloudinaryPublicId, mediaType } = media;
      await this.cloudinaryInstance.uploader.destroy(cloudinaryPublicId, {
        resource_type:
          mediaType === MediaType.VIDEO ? MediaType.VIDEO : MediaType.IMAGE,
      });

      return true;
    } catch (err) {
      this.logger.error(`Failed to delete media ${mediaId} from Cloud`, err);
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
