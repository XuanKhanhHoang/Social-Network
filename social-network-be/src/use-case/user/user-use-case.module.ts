import { Module } from '@nestjs/common';
import { GetMePreviewProfileService } from './get-me-preview-profile/get-me-preview-profile.service';
import { GetUserHeaderService } from './get-user-header/get-user-header.service';
import { GetUserBioService } from './get-user-bio/get-user-bio.service';
import { GetUserFriendsPreviewService } from './get-user-friends-preview/get-user-friends-preview.service';
import { GetUserProfileService } from './get-user-profile/get-user-profile.service';
import { GetUserPhotosService } from './get-user-photos/get-user-photos.service';
import { UserService } from 'src/domains/user/user.service';
import { PostService } from 'src/domains/post/post.service';

@Module({
  imports: [UserService, PostService],
  providers: [
    GetMePreviewProfileService,
    GetUserHeaderService,
    GetUserBioService,
    GetUserFriendsPreviewService,
    GetUserProfileService,
    GetUserPhotosService,
  ],
  exports: [
    GetMePreviewProfileService,
    GetUserHeaderService,
    GetUserBioService,
    GetUserFriendsPreviewService,
    GetUserProfileService,
    GetUserPhotosService,
  ],
})
export class UserUseCaseModule {}
