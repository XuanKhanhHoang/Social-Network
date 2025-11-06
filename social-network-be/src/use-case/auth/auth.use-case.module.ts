import { Module } from '@nestjs/common';
import { LoginService } from './login/login.service';
import { RegisterService } from './register/register.service';
import { VerifyEmailService } from './verify-email/verify-email.service';
import { UserModule } from 'src/domains/user/user.module';
import { AuthModule } from 'src/domains/auth/auth.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [LoginService, RegisterService, VerifyEmailService],
  exports: [LoginService, RegisterService, VerifyEmailService],
})
export class AuthUseCaseModule {}
