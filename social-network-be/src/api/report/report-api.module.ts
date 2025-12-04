import { Module } from '@nestjs/common';
import { ReportApiController } from './report-api.controller';
import { ReportUseCaseModule } from 'src/use-case/report/report-use-case.module';

@Module({
  imports: [ReportUseCaseModule],
  controllers: [ReportApiController],
})
export class ReportApiModule {}
