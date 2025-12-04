import { Module } from '@nestjs/common';
import { AuthModule } from 'src/domains/auth/auth.module';
import { UserModule } from 'src/domains/user/user.module';
import { AdminLoginService } from './login/admin-login.service';

@Module({
  imports: [UserModule, AuthModule],
  providers: [AdminLoginService],
  exports: [AdminLoginService],
})
export class AdminAuthUseCaseModule {}
