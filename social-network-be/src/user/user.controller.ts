import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AllowPublic } from 'src/share/decorators/allow-public-req.decorator';
import { UserService } from './services/user.service';
import { UserProfileService } from './services/user-profile.service';
import { FriendshipService } from './services/friend-ship.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly friendshipService: FriendshipService,
  ) {}

  @Get('me')
  async getMyProfile(@Request() req: any) {
    const userId = req.user._id;
    return this.userService.findByIdBasic(userId);
  }

  @Get(':username/header')
  @AllowPublic()
  async getUserHeader(
    @Param('username') username: string,
    @Request() req: any,
  ) {
    const requestingUserId = req.user?._id ?? null;
    return this.userProfileService.getUserHeader(username, requestingUserId);
  }

  @Get(':username/bio')
  @AllowPublic()
  async getUserBio(@Param('username') username: string, @Request() req: any) {
    const requestingUserId = req.user?._id ?? null;
    return this.userProfileService.getUserBio(username, requestingUserId);
  }

  @Get(':username/friends-preview')
  @AllowPublic()
  async getFriendsPreview(
    @Param('username') username: string,
    @Request() req: any,
  ) {
    const requestingUserId = req.user?._id ?? null;
    return this.friendshipService.getFriendsPreview(username, requestingUserId);
  }

  @Get(':username/profile')
  @AllowPublic()
  async getProfile(@Param('username') username: string, @Request() req: any) {
    const requestingUserId = req.user?._id ?? null;
    return this.userProfileService.getProfileByUsername(
      username,
      requestingUserId,
    );
  }
  @Get(':username/photos-preview')
  @AllowPublic()
  async getPhotosPreview(
    @Param('username') username: string,
    @Request() req: any,
    @Query('limit') limit: number,
  ) {
    const requestingUserId = req.user?._id ?? null;
    return this.userProfileService.getPhotosPreview(username, requestingUserId);
  }
}
