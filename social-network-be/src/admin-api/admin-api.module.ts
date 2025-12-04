import { Module } from '@nestjs/common';
import { AdminAuthApiModule } from './auth/admin-auth-api.module';
import { AdminUserApiModule } from './user/admin-user-api.module';

@Module({
  imports: [AdminAuthApiModule, AdminUserApiModule],
})
export class AdminApiModule {}
