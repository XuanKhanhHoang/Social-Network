import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/share/decorators/allow-public-req.decorator';
import { IS_SEMI_PUBLIC_KEY } from 'src/share/decorators/allow-semi-public.decorator';
import { UserRepository } from 'src/domains/user/user.repository';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userRepository: UserRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const isSemiPublic = this.reflector.getAllAndOverride<boolean>(
      IS_SEMI_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    const accessToken = request.cookies?.accessToken;
    const refreshToken = request.cookies?.refreshToken;

    if (!accessToken && !refreshToken && !isSemiPublic) {
      throw new UnauthorizedException('No tokens provided');
    }

    if (isSemiPublic && !accessToken && !refreshToken) return true;

    try {
      if (accessToken) {
        const payload = this.jwtService.verify(accessToken);
        if (!payload._id) throw new Error();

        const user = await this.userRepository.findById(payload._id, {
          projection: {
            _id: 1,
            role: 1,
            status: 1,
            deletedAt: 1,
          },
        });

        if (!user || user.deletedAt)
          throw new UnauthorizedException('User not found');

        if (user.status === 'locked') {
          throw new UnauthorizedException('Account is locked');
        }

        request['user'] = {
          _id: user._id.toString(),
          role: user.role,
        };
        return true;
      }

      if (refreshToken) throw new Error();
    } catch (error) {
      if (refreshToken) {
        try {
          const payload = this.jwtService.verify(refreshToken);

          const user = await this.userRepository.findById(payload._id, {
            projection: { _id: 1, role: 1, status: 1, deletedAt: 1 },
          });
          if (!user || user.deletedAt)
            throw new UnauthorizedException('User not found');

          if (user.status === 'locked') {
            throw new UnauthorizedException('Account is locked');
          }

          const newAccessToken = this.jwtService.sign(
            { _id: payload._id },
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
          );

          response.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge:
              Number(process.env.JWT_ACCESS_EXPIRES_IN?.slice(0, -1) || '15') *
              60 *
              1000,
          });

          request['user'] = {
            _id: user._id.toString(),
            role: user.role,
          };
          return true;
        } catch (refreshError) {
          response.clearCookie('accessToken');
          response.clearCookie('refreshToken');
          if (isSemiPublic) return true;
          throw new UnauthorizedException('Invalid tokens');
        }
      }
      if (isSemiPublic) return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
