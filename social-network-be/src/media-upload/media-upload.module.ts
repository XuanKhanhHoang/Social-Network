import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MediaUploadController } from './media-upload.controller';
import { MediaUploadService } from './media-upload.service';
import { CloudinaryProvider } from './cloudinary.config';
import { MediaUpload, MediaUploadSchema } from 'src/schemas';
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: MediaUpload.name, schema: MediaUploadSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MediaUploadController],
  providers: [MediaUploadService, CloudinaryProvider],
  exports: [MediaUploadService],
})
export class MediaUploadModule {}
