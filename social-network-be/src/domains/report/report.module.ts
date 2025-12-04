import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema } from 'src/schemas/report.schema';
import { ReportRepository } from './report.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Report', schema: ReportSchema }]),
  ],
  providers: [ReportRepository],
  exports: [ReportRepository],
})
export class ReportModule {}
