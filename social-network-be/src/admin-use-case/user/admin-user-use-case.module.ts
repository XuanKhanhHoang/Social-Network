import { Module } from '@nestjs/common';
import { GetUsersService } from './get-users/get-users.service';
import { GetUserDetailService } from './get-user-detail/get-user-detail.service';
import { UpdateUserService } from './update-user/update-user.service';
import { LockUserService } from './lock-user/lock-user.service';
import { DeleteUserService } from './delete-user/delete-user.service';
import { RestoreUserService } from './restore-user/restore-user.service';
import { UserModule } from 'src/domains/user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    GetUsersService,
    GetUserDetailService,
    UpdateUserService,
    LockUserService,
    DeleteUserService,
    RestoreUserService,
  ],
  exports: [
    GetUsersService,
    GetUserDetailService,
    UpdateUserService,
    LockUserService,
    DeleteUserService,
    RestoreUserService,
  ],
})
export class AdminUserUseCaseModule {}
