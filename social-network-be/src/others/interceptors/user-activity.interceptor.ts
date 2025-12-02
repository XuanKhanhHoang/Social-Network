import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtUserGuardOutput } from 'src/domains/auth/interfaces/jwt-user-guard-output';
import { UserRepository } from 'src/domains/user/user.repository';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserActivityInterceptor.name);
  constructor(private readonly userRepository: UserRepository) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: JwtUserGuardOutput = request.user;

    if (user) {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

      if (user.lastActiveAt && new Date(user.lastActiveAt) > twoMinutesAgo) {
        return next.handle();
      }

      this.userRepository.updateLastActive(user._id, now).catch(() => {
        this.logger.error(
          `Failed to update last active time for user ${user._id}`,
        );
      });
    }

    return next.handle();
  }
}
