import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './share/module/mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApiModule } from './api/api.module';
import { RankingUseCaseModule } from './use-case/ranking/ranking-use-case.module';
import { FeedUseCaseModule } from './use-case/feed/feed-use-case.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    MailModule,
    ApiModule,
    RankingUseCaseModule,
    FeedUseCaseModule,
  ],
})
export class AppModule {}
