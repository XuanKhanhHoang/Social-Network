import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaUploadService } from './media-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfirmTempMediaDto } from './dtos/confirm-temp-media.dto';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaUploadController {
  constructor(private readonly mediaUploadService: MediaUploadService) {}

  @Post('upload-temp')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 200 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|avi|mov|webm)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only images and videos are allowed'), false);
        }
      },
    }),
  )
  async uploadTemporary(
    @UploadedFile() file: Express.Multer.File,
    @GetUserId() userId: string,
  ) {
    return this.mediaUploadService.uploadTemporary(file, userId);
  }

  @Post('confirm')
  async confirmUpload(
    @Body() confirmDto: ConfirmTempMediaDto,
    @GetUserId() userId: string,
  ) {
    return this.mediaUploadService.confirmUpload(confirmDto.tempId, userId);
  }

  @Delete('temp/:id')
  async cancelUpload(
    @Param('id') tempMediaId: string,
    @GetUserId() userId: string,
  ) {
    return this.mediaUploadService.cancelUpload(tempMediaId, userId);
  }
}
