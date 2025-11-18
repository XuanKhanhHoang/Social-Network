import { Module } from '@nestjs/common';
import { GetMePreviewProfileService } from './get-me-preview-profile/get-me-preview-profile.service';
import { GetUserHeaderService } from './get-user-header/get-user-header.service';
import { GetUserBioService } from './get-user-bio/get-user-bio.service';
import { GetUserFriendsPreviewService } from './get-user-friends-preview/get-user-friends-preview.service';
import { GetUserProfileService } from './get-user-profile/get-user-profile.service';
import { GetUserPhotosService } from './get-user-photos/get-user-photos.service';
import { UserModule } from 'src/domains/user/user.module';
import { PostModule } from 'src/domains/post/post.module';
import { CleanupUnverifiedAccountsListenerService } from './listeners/listeners.service';
import { GetUserPostsService } from './get-user-posts/get-user-posts.service';
import { CommentModule } from 'src/domains/comment/comment.module';

@Module({
  imports: [UserModule, PostModule, CommentModule],
  providers: [
    GetMePreviewProfileService,
    GetUserHeaderService,
    GetUserBioService,
    GetUserFriendsPreviewService,
    GetUserProfileService,
    GetUserPhotosService,
    CleanupUnverifiedAccountsListenerService,
    GetUserPostsService,
  ],
  exports: [
    GetMePreviewProfileService,
    GetUserHeaderService,
    GetUserBioService,
    GetUserFriendsPreviewService,
    GetUserProfileService,
    GetUserPhotosService,
    GetUserPostsService,
  ],
})
export class UserUseCaseModule {}
