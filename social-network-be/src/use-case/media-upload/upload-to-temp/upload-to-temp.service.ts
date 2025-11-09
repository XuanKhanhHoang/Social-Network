import { Injectable } from '@nestjs/common';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from 'ffprobe-static';
import { PassThrough } from 'stream';

export interface UploadToTempServiceInput {
  file: Express.Multer.File;
  userId: string;
}
export interface UploadToTempServiceOutput {
  _id: string;
  url: string;
  mediaType: string;
  expiresAt: Date;
  width?: number;
  height?: number;
}
@Injectable()
export class UploadToTempService extends BaseUseCaseService<
  UploadToTempServiceInput,
  UploadToTempServiceOutput
> {
  constructor(private readonly mediaUploadService: MediaUploadService) {
    super();
    ffmpeg.setFfprobePath(ffprobeStatic.path);
  }

  private getMediaDimensions(
    file: Express.Multer.File,
  ): Promise<{ width: number; height: number }> {
    if (file.mimetype.startsWith('image/')) {
      return this.getImageDimensions(file.buffer);
    }

    if (file.mimetype.startsWith('video/')) {
      return this.getVideoDimensions(file.buffer);
    }

    throw new Error('Unsupported file type');
  }

  private async getImageDimensions(
    buffer: Buffer,
  ): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return { width: metadata.width || 0, height: metadata.height || 0 };
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      throw new Error('Could not read image metadata');
    }
  }

  private getVideoDimensions(
    buffer: Buffer,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const stream = new PassThrough();
      stream.end(buffer);
      ffmpeg(stream).ffprobe((err, metadata) => {
        if (err) {
          console.error('Error getting video dimensions:', err);
          return reject(new Error('Could not read video metadata'));
        }

        const videoStream = metadata.streams.find(
          (s) => s.codec_type === 'video',
        );

        if (!videoStream) {
          return reject(new Error('No video stream found in file'));
        }

        resolve({
          width: videoStream.width || 0,
          height: videoStream.height || 0,
        });
      });
    });
  }

  async execute(
    input: UploadToTempServiceInput,
  ): Promise<UploadToTempServiceOutput> {
    const { file, userId } = input;

    const { width, height } = await this.getMediaDimensions(file);

    return this.mediaUploadService.uploadTemporary(file, userId, width, height);
  }
}
