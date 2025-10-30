import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MediaUploadService } from './media-upload.service';
import { MediaUploadDocument, MediaUploadSchema } from 'src/schemas';
import { CloudinaryProvider } from './cloudinary.config';
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: MediaUploadDocument.name, schema: MediaUploadSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  providers: [MediaUploadService, CloudinaryProvider],
  exports: [MediaUploadService],
})
export class MediaUploadModule {}
