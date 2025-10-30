import { Module } from '@nestjs/common';
import { MediaUploadApiController } from './media-upload-api.controller';
import { MediaUploadUseCaseModule } from 'src/use-case/media-upload/media-upload-use-case.module';

@Module({
  imports: [MediaUploadUseCaseModule],
  controllers: [MediaUploadApiController],
})
export class MediaUploadApiModule {}
