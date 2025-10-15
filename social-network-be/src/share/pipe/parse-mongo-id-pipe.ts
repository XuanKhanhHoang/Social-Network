import { PipeTransform, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string) {
    if (!value || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid or missing comment_id');
    }
    return value;
  }
}
