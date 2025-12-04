import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  GetRegistrationStatsService,
  GetRegistrationStatsOutput,
} from 'src/admin-use-case/report/get-registration-stats/get-registration-stats.service';
import { GetRegistrationStatsDto } from './dto/get-registration-stats.dto';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';

@Controller('admin/reports')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReportApiController {
  constructor(
    private readonly getRegistrationStatsService: GetRegistrationStatsService,
  ) {}

  @Get('registrations')
  async getRegistrationStats(
    @Query() query: GetRegistrationStatsDto,
  ): Promise<GetRegistrationStatsOutput> {
    return this.getRegistrationStatsService.execute(query);
  }
}
