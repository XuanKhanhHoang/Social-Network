import { Injectable } from '@nestjs/common';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface DeleteTempServiceInput {
  mediaId: string;
  userId: string;
}
export interface DeleteTempServiceOutput {
  message: string;
}
@Injectable()
export class DeleteTempFileService extends BaseUseCaseService<
  DeleteTempServiceInput,
  DeleteTempServiceOutput
> {
  constructor(private readonly mediaUploadService: MediaUploadService) {
    super();
  }
  async execute(
    input: DeleteTempServiceInput,
  ): Promise<DeleteTempServiceOutput> {
    const { mediaId, userId } = input;
    return this.mediaUploadService.cancelUpload(mediaId, userId);
  }
}
