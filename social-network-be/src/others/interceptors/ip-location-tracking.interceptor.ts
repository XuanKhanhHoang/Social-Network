import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtUserGuardOutput } from 'src/domains/auth/interfaces/jwt-user-guard-output';
import { UpdateUserIpLocationService } from 'src/use-case/ip-location-tracking/update-user-ip-location/update-user-ip-location.service';

@Injectable()
export class IpLocationInterceptor implements NestInterceptor {
  constructor(
    private readonly updateUserIpLocationService: UpdateUserIpLocationService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: JwtUserGuardOutput = request?.user;

    if (user) {
      const ip =
        request.headers['x-forwarded-for'] ||
        request.socket.remoteAddress ||
        request.ip;

      const cleanIp = Array.isArray(ip) ? ip[0] : ip;
      this.updateUserIpLocationService.execute({
        userId: user._id.toString(),
        ip: cleanIp,
        lastLocationUpdatedAt: user.lastDetectedLocationUpdatedAt,
      });
    }

    return next.handle();
  }
}
