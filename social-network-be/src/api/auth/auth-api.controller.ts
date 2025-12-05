import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  Req,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from '../../use-case/auth/login/login.service';
import { RegisterService } from '../../use-case/auth/register/register.service';
import { VerifyEmailService } from '../../use-case/auth/verify-email/verify-email.service';
import { ChangePasswordService } from '../../use-case/auth/change-password/change-password.service';
import { ForgotPasswordService } from '../../use-case/auth/forgot-password/forgot-password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto';
import { ChangePasswordRequestDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AllowPublic } from 'src/share/decorators/allow-public-req.decorator';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private registerUserService: RegisterService,
    private loginUserService: LoginService,
    private verifyEmailService: VerifyEmailService,
    private changePasswordService: ChangePasswordService,
    private forgotPasswordService: ForgotPasswordService,
  ) {}

  @Post('register')
  @AllowPublic()
  async register(@Body() registerDto: RegisterDto) {
    return this.registerUserService.execute(registerDto);
  }

  @Post('login')
  @AllowPublic()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const existingToken =
      req.cookies?.accessToken ||
      req.cookies?.['access-token'] ||
      req.cookies?.['auth-token'];

    if (existingToken) {
      throw new UnauthorizedException('User already logged in');
    }
    const data = await this.loginUserService.execute(loginDto);

    res.cookie('accessToken', data.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge:
        Number(process.env.JWT_ACCESS_EXPIRES_IN.slice(0, -1)) * 60 * 1000,
    });

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge:
        Number(process.env.JWT_REFRESH_EXPIRES_IN.slice(0, -1)) *
        24 *
        60 *
        60 *
        1000,
    });

    return {
      message: data.message,
      user: data.user,
      keyVault: data.keyVault,
    };
  }

  @Get('verify-email/:token')
  @AllowPublic()
  async verifyEmail(@Param('token') token: string) {
    return this.verifyEmailService.execute({ token });
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }

  @Patch('change-password')
  async changePassword(
    @GetUserId() userId: string,
    @Body() dto: ChangePasswordRequestDto,
  ) {
    await this.changePasswordService.execute(userId, dto);
    return { message: 'Đổi mật khẩu thành công' };
  }

  @Post('forgot-password')
  @AllowPublic()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordService.execute(dto);
  }

  @Post('check')
  @HttpCode(HttpStatus.NO_CONTENT)
  check() {
    return;
  }
}
