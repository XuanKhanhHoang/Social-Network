import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MediaUploadModule } from './media-upload/media-upload.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ReactionModule } from './reaction/reaction.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { RankingModule } from './ranking/ranking.module';
import { PostModule } from './domains/post/post.module';
import { PostModule } from './use-case/post/post.module';
import { PostReService } from './use-case/post.re/post.re.service';
import { GetPostsFeedService } from './use-case/get-posts-feed/get-posts-feed.service';
import { CommentModule } from './domains/comment/comment.module';
import { ApiModule } from './api/api/api.module';
import { ApiModule } from './api/api.module';
import { CommentModule } from './use-case/comment/comment.module';
import { GetPostCommentsService } from './use-case/comment/get-post-comments/get-post-comments.service';
import { GetReplyCommentsService } from './use-case/comment/get-reply-comments/get-reply-comments.service';
import { CreateCommentService } from './use-case/comment/create-comment/create-comment.service';
import { UpdateCommentService } from './use-case/comment/update-comment/update-comment.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: process.env.MAIL_FROM,
        },
        template: {
          dir: join(__dirname, '/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    MailModule,
    MediaUploadModule,
    PostModule,
    CommentModule,
    ReactionModule,
    UserModule,
    RankingModule,
    ApiModule,
  ],
  providers: [PostReService, GetPostsFeedService, GetPostCommentsService, GetReplyCommentsService, CreateCommentService, UpdateCommentService],
})
export class AppModule {}
