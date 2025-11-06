import { Module } from '@nestjs/common';
import { CommentModule } from 'src/domains/comment/comment.module';
import { PostModule } from 'src/domains/post/post.module';
import { CreateCommentService } from './create-comment/create-comment.service';
import { GetPostCommentsService } from './get-post-comments/get-post-comments.service';
import { GetReplyCommentsService } from './get-reply-comments/get-reply-comments.service';
import { UpdateCommentService } from './update-comment/update-comment.service';
import { MediaUploadModule } from 'src/domains/media-upload/media-upload.module';
import { UserModule } from 'src/domains/user/user.module';

@Module({
  imports: [PostModule, CommentModule, MediaUploadModule, UserModule],
  exports: [
    CreateCommentService,
    GetPostCommentsService,
    GetReplyCommentsService,
    UpdateCommentService,
  ],
  providers: [
    CreateCommentService,
    GetPostCommentsService,
    GetReplyCommentsService,
    UpdateCommentService,
  ],
})
export class CommentUseCaseModule {}
