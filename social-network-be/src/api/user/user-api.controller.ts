import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/domains/auth/jwt-auth.guard';
import { AllowSemiPublic } from 'src/share/decorators/allow-semi-public.decorator';
import { GetUserId } from 'src/share/decorators/user.decorator';
import {
  GetMePreviewProfileService,
  GetUserBioService,
  GetUserFriendsPreviewService,
  GetUserProfileService,
  GetUserPhotosService,
  GetUserHeaderService,
  GetUserPostsService,
} from 'src/use-case/user';
import { GetUserPostsQueryDto } from './dto/get-user-post.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserApiController {
  constructor(
    private readonly getMeProfileService: GetMePreviewProfileService,
    private readonly getUserBioService: GetUserBioService,
    private readonly getUserFriendsPreviewService: GetUserFriendsPreviewService,
    private readonly getUserProfileService: GetUserProfileService,
    private readonly getUserPhotosPreviewService: GetUserPhotosService,
    private readonly getUserHeaderService: GetUserHeaderService,
    private readonly getUserPostsService: GetUserPostsService,
  ) {}

  @Get('me')
  async getMyProfile(@GetUserId() userId: string) {
    return this.getMeProfileService.execute({ userId });
  }

  @Get(':username/header')
  @AllowSemiPublic()
  async getUserHeader(
    @Param('username') username: string,
    @GetUserId() requestingUserId?: string,
  ) {
    return this.getUserHeaderService.execute({ username, requestingUserId });
  }

  @Get(':username/bio')
  @AllowSemiPublic()
  async getUserBio(
    @Param('username') username: string,
    @GetUserId() requestingUserId?: string,
  ) {
    return this.getUserBioService.execute({ username, requestingUserId });
  }

  @Get(':username/friends-preview')
  @AllowSemiPublic()
  async getFriendsPreview(
    @Param('username') username: string,
    @GetUserId() requestingUserId?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.getUserFriendsPreviewService.execute({
      username,
      requestingUserId: requestingUserId,
      limit,
      page,
    });
  }

  @Get(':username/profile')
  @AllowSemiPublic()
  async getProfile(
    @Param('username') username: string,
    @GetUserId() requestingUserId?: string,
  ) {
    return this.getUserProfileService.execute({ username, requestingUserId });
  }
  @Get(':username/photos-preview')
  @AllowSemiPublic()
  async getPhotosPreview(
    @Param('username') username: string,
    @GetUserId() requestingUserId?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.getUserPhotosPreviewService.execute({
      username,
      requestingUserId,
      limit,
      page,
    });
  }
  @Get(':username/posts')
  @AllowSemiPublic()
  async getPosts(
    @Param('username') username: string,
    @Query() query: GetUserPostsQueryDto,
    @GetUserId() requestingUserId?: string,
  ) {
    return this.getUserPostsService.execute({
      ...query,
      userId: requestingUserId,
      username,
    });
  }
}
