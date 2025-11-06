import { Module } from '@nestjs/common';
import { ReactionApiController } from './reaction-api.controller';
import { ReactionUseCaseModule } from 'src/use-case/reaction/reaction-use-case.module';

@Module({
  imports: [ReactionUseCaseModule],
  controllers: [ReactionApiController],
})
export class ReactionApiModule {}
