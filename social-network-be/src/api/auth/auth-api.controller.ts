import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from '../../use-case/auth/login/login.service';
import { RegisterService } from '../../use-case/auth/register/register.service';
import { VerifyEmailService } from '../../use-case/auth/verify-email/verify-email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private registerUserService: RegisterService,
    private loginUserService: LoginService,
    private verifyEmailService: VerifyEmailService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.registerUserService.execute(registerDto);
  }

  @Post('login')
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
      return new UnauthorizedException('User already logged in');
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
    };
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.verifyEmailService.execute({ token });
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }
}
