import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentDocument, CommentSchema } from 'src/schemas';
import { CommentRepository } from './comment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentDocument.name, schema: CommentSchema },
    ]),
  ],
  providers: [CommentRepository],
  exports: [CommentRepository],
})
export class CommentModule {}
