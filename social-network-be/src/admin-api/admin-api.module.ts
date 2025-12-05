import { Module } from '@nestjs/common';
import { AdminAuthApiModule } from './auth/admin-auth-api.module';
import { AdminUserApiModule } from './user/admin-user-api.module';
import { AdminPostApiModule } from './post/admin-post-api.module';
import { AdminCommentApiModule } from './comment/admin-comment-api.module';
import { AdminReportApiModule } from './report/admin-report-api.module';
import { AdminDashboardApiModule } from './dashboard/admin-dashboard-api.module';

@Module({
  imports: [
    AdminAuthApiModule,
    AdminUserApiModule,
    AdminPostApiModule,
    AdminCommentApiModule,
    AdminReportApiModule,
    AdminDashboardApiModule,
  ],
})
export class AdminApiModule {}
