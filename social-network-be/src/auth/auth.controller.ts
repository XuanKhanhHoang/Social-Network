import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailResponseDto } from './dtos';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
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
    return this.authService.login(loginDto, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body('token') token: string,
  ): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(token);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @GetUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.validateUser(userId, res);
  }
}
