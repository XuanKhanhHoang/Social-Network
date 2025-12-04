import { Module } from '@nestjs/common';
import { AdminAuthUseCaseModule } from 'src/admin-use-case/auth/admin-auth-use-case.module';
import { AdminAuthApiController } from './admin-auth-api.controller';

@Module({
  imports: [AdminAuthUseCaseModule],
  controllers: [AdminAuthApiController],
})
export class AdminAuthApiModule {}
