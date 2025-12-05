import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  GetUsersService,
  GetUsersOutput,
} from 'src/admin-use-case/user/get-users/get-users.service';
import { GetUsersDto } from './dto/get-users.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';
import {
  GetUserDetailService,
  GetUserDetailOutput,
} from 'src/admin-use-case/user/get-user-detail/get-user-detail.service';
import {
  UpdateUserService,
  UpdateUserOutput,
} from 'src/admin-use-case/user/update-user/update-user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  LockUserService,
  LockUserOutput,
} from 'src/admin-use-case/user/lock-user/lock-user.service';
import {
  DeleteUserService,
  DeleteUserOutput,
} from 'src/admin-use-case/user/delete-user/delete-user.service';
import {
  RestoreUserService,
  RestoreUserOutput,
} from 'src/admin-use-case/user/restore-user/restore-user.service';

@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUserApiController {
  constructor(
    private readonly getUsersService: GetUsersService,
    private readonly getUserDetailService: GetUserDetailService,
    private readonly updateUserService: UpdateUserService,
    private readonly lockUserService: LockUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly restoreUserService: RestoreUserService,
  ) {}

  @Get()
  async getUsers(@Query() query: GetUsersDto): Promise<GetUsersOutput> {
    return this.getUsersService.execute(query);
  }

  @Get(':id')
  async getUserDetail(@Param('id') id: string): Promise<GetUserDetailOutput> {
    return this.getUserDetailService.execute(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UpdateUserOutput> {
    return this.updateUserService.execute({ userId: id, ...body });
  }

  @Patch(':id/lock')
  async lockUser(@Param('id') id: string): Promise<LockUserOutput> {
    return this.lockUserService.execute(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<DeleteUserOutput> {
    return this.deleteUserService.execute(id);
  }

  @Patch(':id/restore')
  async restoreUser(@Param('id') id: string): Promise<RestoreUserOutput> {
    return this.restoreUserService.execute(id);
  }
}
