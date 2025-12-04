import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  GetCommentsService,
  GetCommentsOutput,
} from 'src/admin-use-case/comment/get-comments/get-comments.service';
import { GetCommentsDto } from './dto/get-comments.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';

@Controller('admin/comments')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCommentApiController {
  constructor(private readonly getCommentsService: GetCommentsService) {}

  @Get()
  async getComments(
    @Query() query: GetCommentsDto,
  ): Promise<GetCommentsOutput> {
    return this.getCommentsService.execute(query);
  }
}
