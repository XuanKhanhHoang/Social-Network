import { Injectable, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';

@Injectable()
export class IpLocationTrackingService {
  private readonly logger = new Logger(IpLocationTrackingService.name);

  lookupCity(ip: string): string | null {
    try {
      const geo = geoip.lookup(ip);
      if (geo && geo.city) {
        return geo.city;
      }
      return null;
    } catch (error) {
      this.logger.warn(`GeoIP lookup failed for IP ${ip}: ${error.message}`);
      return null;
    }
  }
}
