import { Module } from '@nestjs/common';
import { PostModule } from 'src/domains/post/post.module';
import { ReportModule } from 'src/domains/report/report.module';
import { GetPostsService } from './get-posts/get-posts.service';
import { AdminDeletePostService } from './admin-delete-post/admin-delete-post.service';
import { AdminRestorePostService } from './admin-restore-post/admin-restore-post.service';

@Module({
  imports: [PostModule, ReportModule],
  providers: [GetPostsService, AdminDeletePostService, AdminRestorePostService],
  exports: [GetPostsService, AdminDeletePostService, AdminRestorePostService],
})
export class AdminPostUseCaseModule {}
