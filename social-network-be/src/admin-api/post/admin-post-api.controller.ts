import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  GetPostsService,
  GetPostsOutput,
} from 'src/admin-use-case/post/get-posts/get-posts.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';

@Controller('admin/posts')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPostApiController {
  constructor(private readonly getPostsService: GetPostsService) {}

  @Get()
  async getPosts(@Query() query: GetPostsDto): Promise<GetPostsOutput> {
    return this.getPostsService.execute(query);
  }
}
