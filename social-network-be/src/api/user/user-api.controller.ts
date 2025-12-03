import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AllowSemiPublic } from 'src/share/decorators/allow-semi-public.decorator';
import { GetUserId } from 'src/share/decorators/user.decorator';
import {
  GetUserBioService,
  GetUserFriendsPreviewService,
  GetUserProfileService,
  GetUserPhotosService,
  GetUserHeaderService,
  GetUserPostsService,
  UpdateProfileService,
  GetSuggestFriendsService,
  GetMePreviewProfileService,
  GetPublicKeyService,
  SearchUserService,
} from 'src/use-case/user';
import { GetUserPostsQueryDto } from './dto/get-user-post.dto';
import { GetAccountService } from 'src/use-case/user/get-account/get-account.service';
import { UpdateAccountService } from 'src/use-case/user/update-account/update-account.service';
import { CursorPaginationQueryDto } from 'src/share/dto/req/cursor-pagination-query.dto';
import { CursorPaginationWithSearchQueryDto } from 'src/share/dto/req/cursor-pagination-with-search-query.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateProfileDto } from './dto/update-user-profile';
@Controller('users')
export class UserApiController {
  constructor(
    private readonly getUserHeaderService: GetUserHeaderService,
    private readonly getUserBioService: GetUserBioService,
    private readonly getUserFriendsPreviewService: GetUserFriendsPreviewService,
    private readonly getUserProfileService: GetUserProfileService,
    private readonly getUserPhotosPreviewService: GetUserPhotosService,
    private readonly getUserPostsService: GetUserPostsService,
    private readonly updateProfileService: UpdateProfileService,
    private readonly getAccountService: GetAccountService,
    private readonly updateAccountService: UpdateAccountService,
    private readonly getSuggestFriendsService: GetSuggestFriendsService,
    private readonly getMeProfileService: GetMePreviewProfileService,
    private readonly getPublicKeyService: GetPublicKeyService,
    private readonly searchUserService: SearchUserService,
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
    @Query() query: CursorPaginationWithSearchQueryDto,
    @GetUserId() requestingUserId?: string,
  ) {
    const { limit, cursor: cursorStr, search } = query;
    const cursorN = cursorStr ? Number(cursorStr) : undefined;
    const cursor = isNaN(cursorN) ? cursorStr : cursorN;
    return this.getUserFriendsPreviewService.execute({
      username,
      requestingUserId,
      limit,
      cursor,
      search,
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
  async getPhotosPreview(
    @Param('username') username: string,
    @Query() query: CursorPaginationQueryDto,
    @GetUserId() requestingUserId: string,
  ) {
    const { limit, cursor: cursorStr } = query;
    const cursorN = cursorStr ? Number(cursorStr) : undefined;
    const cursor = isNaN(cursorN) ? undefined : cursorN;
    return this.getUserPhotosPreviewService.execute({
      username,
      requestingUserId,
      limit,
      cursor,
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
  @Patch(':username/profile')
  async updateProfile(
    @GetUserId() requestingUserId: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.updateProfileService.execute({
      ...body,
      requestingUserId,
    });
  }
  @Get('account')
  async getAccount(@GetUserId() requestingUserId: string) {
    return this.getAccountService.execute({ userId: requestingUserId });
  }
  @Patch('account')
  async updateAccount(
    @GetUserId() requestingUserId: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.updateAccountService.execute({
      userId: requestingUserId,
      ...dto,
    });
  }
  @Get('suggest-friends')
  async getSuggestFriends(
    @GetUserId() requestingUserId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const { limit, cursor } = query;
    return this.getSuggestFriendsService.execute({
      userId: requestingUserId,
      limit,
      cursor,
    });
  }

  @Get(':userId/public-key')
  async getPublicKey(@Param('userId') userId: string) {
    return this.getPublicKeyService.execute({ userId });
  }

  @Get('search')
  async searchUsers(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationWithSearchQueryDto,
  ) {
    return this.searchUserService.execute({
      userId,
      query: query.search,
      limit: Number(query.limit || 10),
      cursor: query.cursor,
    });
  }
}
