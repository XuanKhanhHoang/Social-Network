import { Module } from '@nestjs/common';
import { MediaUploadModule } from 'src/domains/media-upload/media-upload.module';
import { UploadToTempService } from './upload-to-temp/upload-to-temp.service';
import { DeleteTempFileService } from './delete-temp-file/delete-temp-file.service';

@Module({
  imports: [MediaUploadModule],
  providers: [UploadToTempService, DeleteTempFileService],
  exports: [UploadToTempService, DeleteTempFileService],
})
export class MediaUploadUseCaseModule {}
