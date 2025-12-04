import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  AdminLoginService,
  AdminLoginOutput,
} from 'src/admin-use-case/auth/login/admin-login.service';
import { AdminLoginDto } from 'src/admin-api/auth/login/admin-login.dto';
import { AllowPublic } from 'src/share/decorators/allow-public-req.decorator';

@Controller('admin/auth')
export class AdminAuthApiController {
  constructor(private readonly adminLoginService: AdminLoginService) {}

  @AllowPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: AdminLoginDto): Promise<AdminLoginOutput> {
    return this.adminLoginService.execute(body);
  }
}
