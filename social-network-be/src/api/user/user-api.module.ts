import { Module } from '@nestjs/common';
import { UserApiController } from './user-api.controller';
import { UserUseCaseModule } from 'src/use-case/user/user-use-case.module';

@Module({
  imports: [UserUseCaseModule],
  controllers: [UserApiController],
})
export class UserApiModule {}
