import {
  Controller,
  Get,
  Delete,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  GetPostsService,
  GetPostsOutput,
} from 'src/admin-use-case/post/get-posts/get-posts.service';
import {
  AdminDeletePostService,
  AdminDeletePostOutput,
} from 'src/admin-use-case/post/admin-delete-post/admin-delete-post.service';
import {
  AdminRestorePostService,
  AdminRestorePostOutput,
} from 'src/admin-use-case/post/admin-restore-post/admin-restore-post.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('admin/posts')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPostApiController {
  constructor(
    private readonly getPostsService: GetPostsService,
    private readonly adminDeletePostService: AdminDeletePostService,
    private readonly adminRestorePostService: AdminRestorePostService,
  ) {}

  @Get()
  async getPosts(@Query() query: GetPostsDto): Promise<GetPostsOutput> {
    return this.getPostsService.execute(query);
  }

  @Delete(':postId')
  async deletePost(
    @Param('postId') postId: string,
    @GetUserId() adminId: string,
  ): Promise<AdminDeletePostOutput> {
    return this.adminDeletePostService.execute({ postId, adminId });
  }

  @Post(':postId/restore')
  async restorePost(
    @Param('postId') postId: string,
  ): Promise<AdminRestorePostOutput> {
    return this.adminRestorePostService.execute({ postId });
  }
}
