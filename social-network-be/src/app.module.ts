import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalUseCaseModule } from './use-case/global-use-case/global-use-case';
import { ApiModule } from './api/api.module';
import { MailModule } from './share/module/mail/mail.module';
import { AdminApiModule } from './admin-api/admin-api.module';

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
    GlobalUseCaseModule,
    ApiModule,
    MailModule,
    AdminApiModule,
  ],
})
export class AppModule {}
