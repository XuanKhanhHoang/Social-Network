import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthUseCaseModule } from 'src/use-case/auth/auth.use-case.module';

@Module({
  imports: [AuthUseCaseModule],
  controllers: [AuthController],
})
export class AuthApiModuleModule {}
