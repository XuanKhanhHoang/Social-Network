import { Module } from '@nestjs/common';
import { AuthModule } from 'src/domains/auth/auth.module';
import { UserModule } from 'src/domains/user/user.module';
import { AdminLoginService } from './login/admin-login.service';
import { VerifyAdminService } from './verify/verify-admin.service';

@Module({
  imports: [UserModule, AuthModule],
  providers: [AdminLoginService, VerifyAdminService],
  exports: [AdminLoginService, VerifyAdminService],
})
export class AdminAuthUseCaseModule {}
