import { Injectable } from '@nestjs/common';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface ConfirmTempFileServiceInput {
  mediaId: string;
  userId: string;
}
export interface COnfirmTempFileServiceOutput {
  id: string;
  url: string;
  publicId: string;
  mediaType: string;
  message: string;
}
@Injectable()
export class ConfirmTempFileService extends BaseUseCaseService<
  ConfirmTempFileServiceInput,
  COnfirmTempFileServiceOutput
> {
  constructor(private readonly mediaUploadService: MediaUploadService) {
    super();
  }
  async execute(
    input: ConfirmTempFileServiceInput,
  ): Promise<COnfirmTempFileServiceOutput> {
    const { mediaId, userId } = input;
    return this.mediaUploadService.confirmUpload(mediaId, userId);
  }
}
