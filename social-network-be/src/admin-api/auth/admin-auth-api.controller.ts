import {
  Body,
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AdminLoginService,
  AdminLoginOutput,
} from 'src/admin-use-case/auth/login/admin-login.service';
import {
  VerifyAdminService,
  VerifyAdminOutput,
} from 'src/admin-use-case/auth/verify/verify-admin.service';
import { AdminLoginDto } from 'src/admin-api/auth/login/admin-login.dto';
import { AllowPublic } from 'src/share/decorators/allow-public-req.decorator';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { Response } from 'express';

@Controller('admin/auth')
export class AdminAuthApiController {
  constructor(
    private readonly adminLoginService: AdminLoginService,
    private readonly verifyAdminService: VerifyAdminService,
  ) {}

  @AllowPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ): Promise<AdminLoginOutput> {
    const existingToken =
      req.cookies?.accessToken ||
      req.cookies?.['access-token'] ||
      req.cookies?.['auth-token'];

    if (existingToken) {
      throw new UnauthorizedException('User already logged in');
    }
    const data = await this.adminLoginService.execute(body);
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
    return data;
  }

  @Get('verify')
  async verify(@GetUserId() userId: string): Promise<VerifyAdminOutput> {
    return this.verifyAdminService.execute({ userId });
  }
}
