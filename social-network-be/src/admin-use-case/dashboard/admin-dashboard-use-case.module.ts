import { Module } from '@nestjs/common';
import { UserModule } from 'src/domains/user/user.module';
import { PostModule } from 'src/domains/post/post.module';
import { ReportModule } from 'src/domains/report/report.module';
import { GetDashboardStatsService } from './get-stats/get-dashboard-stats.service';
import { GetUserGrowthChartService } from './get-user-growth/get-user-growth-chart.service';

@Module({
  imports: [UserModule, PostModule, ReportModule],
  providers: [GetDashboardStatsService, GetUserGrowthChartService],
  exports: [GetDashboardStatsService, GetUserGrowthChartService],
})
export class AdminDashboardUseCaseModule {}
