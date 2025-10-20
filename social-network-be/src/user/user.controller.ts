import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AllowPublic } from 'src/share/decorators/allow-public-req.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:username')
  @AllowPublic()
  async getProfile(@Param('username') username: string, @Request() req: any) {
    const requestingUser = req.user as any;
    const requestingUserId = requestingUser ? requestingUser._id : null;

    return this.userService.getProfileByUsername(username, requestingUserId);
  }
}
