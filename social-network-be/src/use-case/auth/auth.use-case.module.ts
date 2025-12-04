import { Module } from '@nestjs/common';
import { LoginService } from './login/login.service';
import { RegisterService } from './register/register.service';
import { VerifyEmailService } from './verify-email/verify-email.service';
import { UserModule } from 'src/domains/user/user.module';
import { AuthModule } from 'src/domains/auth/auth.module';

import { ChangePasswordService } from './change-password/change-password.service';
import { ForgotPasswordService } from './forgot-password/forgot-password.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [
    LoginService,
    RegisterService,
    VerifyEmailService,
    ChangePasswordService,
    ForgotPasswordService,
  ],
  exports: [
    LoginService,
    RegisterService,
    VerifyEmailService,
    ChangePasswordService,
    ForgotPasswordService,
  ],
})
export class AuthUseCaseModule {}
