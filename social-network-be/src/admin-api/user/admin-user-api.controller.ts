import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  GetUsersService,
  GetUsersOutput,
} from 'src/admin-use-case/user/get-users/get-users.service';
import { GetUsersDto } from './dto/get-users.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';

@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUserApiController {
  constructor(private readonly getUsersService: GetUsersService) {}

  @Get()
  async getUsers(@Query() query: GetUsersDto): Promise<GetUsersOutput> {
    return this.getUsersService.execute(query);
  }
}
