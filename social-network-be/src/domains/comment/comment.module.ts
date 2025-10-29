import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment-repository.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentDocument, CommentSchema } from 'src/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentDocument.name, schema: CommentSchema },
    ]),
  ],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
