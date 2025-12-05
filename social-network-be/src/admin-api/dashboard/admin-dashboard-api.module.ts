import { Module } from '@nestjs/common';
import { AdminDashboardUseCaseModule } from 'src/admin-use-case/dashboard/admin-dashboard-use-case.module';
import { AdminDashboardApiController } from './admin-dashboard-api.controller';

@Module({
  imports: [AdminDashboardUseCaseModule],
  controllers: [AdminDashboardApiController],
})
export class AdminDashboardApiModule {}
