import { Module } from '@nestjs/common';
import { LoginService } from './login/login.service';
import { RegisterService } from './register/register.service';
import { VerifyEmailService } from './verify-email/verify-email.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [LoginService, RegisterService, VerifyEmailService],
  exports: [LoginService, RegisterService, VerifyEmailService],
})
export class AuthUseCaseModule {}
