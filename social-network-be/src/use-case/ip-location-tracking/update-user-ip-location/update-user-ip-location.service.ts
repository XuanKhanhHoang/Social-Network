import { Injectable, Logger } from '@nestjs/common';
import { IpLocationTrackingService } from 'src/domains/ip-location-tracking/ip-location-tracking.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface UpdateUserIpLocationInput {
  userId: string;
  ip: string;
  lastLocationUpdatedAt?: Date;
}

@Injectable()
export class UpdateUserIpLocationService extends BaseUseCaseService<
  UpdateUserIpLocationInput,
  void
> {
  private readonly logger = new Logger(UpdateUserIpLocationService.name);
  private readonly UPDATE_INTERVAL = 30 * 60 * 1000;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly ipLocationTrackingService: IpLocationTrackingService,
  ) {
    super();
  }

  async execute(input: UpdateUserIpLocationInput): Promise<void> {
    const { userId, ip, lastLocationUpdatedAt } = input;

    const lastUpdate = lastLocationUpdatedAt
      ? new Date(lastLocationUpdatedAt).getTime()
      : 0;
    const now = Date.now();

    if (now - lastUpdate < this.UPDATE_INTERVAL) {
      return;
    }

    const city = this.ipLocationTrackingService.lookupCity(ip);

    try {
      if (city) {
        this.logger.log(`Updating location for user ${userId}: ${city}`);
        await this.userRepository.updateById(userId, {
          detectedCity: city,
          lastKnownIp: ip,
          lastDetectedLocationUpdatedAt: new Date(),
        });
      } else {
        await this.userRepository.updateById(userId, {
          lastDetectedLocationUpdatedAt: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to update location for user ${userId}`,
        error.stack,
      );
    }
  }
}
