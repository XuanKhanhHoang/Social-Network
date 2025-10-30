import { Injectable } from '@nestjs/common';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface UploadToTempServiceInput {
  file: Express.Multer.File;
  userId: string;
}
export interface UploadToTempServiceOutput {
  id: string;
  url: string;
  mediaType: string;
  message: string;
  expiresAt: Date;
}
@Injectable()
export class UploadToTempService extends BaseUseCaseService<
  UploadToTempServiceInput,
  UploadToTempServiceOutput
> {
  constructor(private readonly mediaUploadService: MediaUploadService) {
    super();
  }
  async execute(
    input: UploadToTempServiceInput,
  ): Promise<UploadToTempServiceOutput> {
    const { file, userId } = input;
    return this.mediaUploadService.uploadTemporary(file, userId);
  }
}
