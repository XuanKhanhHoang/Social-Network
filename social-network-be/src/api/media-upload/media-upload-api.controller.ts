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
import { JwtAuthGuard } from 'src/domains/auth/jwt-auth.guard';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { ConfirmTempMediaDto } from './dto/confirm-temp-media.dto';
import {
  ConfirmTempFileService,
  DeleteTempFileService,
  UploadToTempService,
} from 'src/use-case/media-upload';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaUploadApiController {
  constructor(
    private readonly uploadToTempService: UploadToTempService,
    private readonly confirmTempFileService: ConfirmTempFileService,
    private readonly deleteTempFileService: DeleteTempFileService,
  ) {}

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
    return this.uploadToTempService.execute({ file, userId });
  }

  @Post('confirm')
  async confirmUpload(
    @Body() confirmDto: ConfirmTempMediaDto,
    @GetUserId() userId: string,
  ) {
    return this.confirmTempFileService.execute({
      mediaId: confirmDto.tempId,
      userId,
    });
  }

  @Delete('temp/:id')
  async cancelUpload(
    @Param('id') tempMediaId: string,
    @GetUserId() userId: string,
  ) {
    return this.deleteTempFileService.execute({ mediaId: tempMediaId, userId });
  }
}
