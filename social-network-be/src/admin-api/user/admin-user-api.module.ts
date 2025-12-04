import { Module } from '@nestjs/common';
import { AdminUserUseCaseModule } from 'src/admin-use-case/user/admin-user-use-case.module';
import { AdminUserApiController } from './admin-user-api.controller';

@Module({
  imports: [AdminUserUseCaseModule],
  controllers: [AdminUserApiController],
})
export class AdminUserApiModule {}
