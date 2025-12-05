import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  GetDashboardStatsService,
  DashboardStatsOutput,
} from 'src/admin-use-case/dashboard/get-stats/get-dashboard-stats.service';
import {
  GetUserGrowthChartService,
  UserGrowthChartOutput,
  ViewMode,
} from 'src/admin-use-case/dashboard/get-user-growth/get-user-growth-chart.service';
import { RolesGuard } from 'src/others/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { UserRole } from 'src/share/enums/user-role.enum';

@Controller('admin/dashboard')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardApiController {
  constructor(
    private readonly getDashboardStatsService: GetDashboardStatsService,
    private readonly getUserGrowthChartService: GetUserGrowthChartService,
  ) {}

  @Get('stats')
  async getStats(): Promise<DashboardStatsOutput> {
    return this.getDashboardStatsService.execute();
  }

  @Get('user-growth')
  async getUserGrowth(
    @Query('mode') mode?: ViewMode,
  ): Promise<UserGrowthChartOutput> {
    return this.getUserGrowthChartService.execute({ mode });
  }
}
