import { Module } from '@nestjs/common';
import { AdminAuthApiModule } from './auth/admin-auth-api.module';
import { AdminUserApiModule } from './user/admin-user-api.module';
import { AdminPostApiModule } from './post/admin-post-api.module';

@Module({
  imports: [AdminAuthApiModule, AdminUserApiModule, AdminPostApiModule],
})
export class AdminApiModule {}
