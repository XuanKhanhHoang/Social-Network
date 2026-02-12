import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Social Network API')
    .setDescription('API documentation cho ứng dụng mạng xã hội')
    .setVersion('1.0')
    .addCookieAuth('accessToken')
    .addTag('Auth', 'Đăng nhập / Đăng ký / Xác thực')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Posts', 'Bài viết')
    .addTag('Comments', 'Bình luận')
    .addTag('Feed', 'Bảng tin')
    .addTag('Friendships', 'Kết bạn / Chặn')
    .addTag('Chat', 'Nhắn tin 1-1')
    .addTag('Group Chat', 'Nhắn tin nhóm')
    .addTag('Reactions', 'Cảm xúc')
    .addTag('Notifications', 'Thông báo')
    .addTag('Media Upload', 'Upload ảnh/video')
    .addTag('Reports', 'Báo cáo vi phạm')
    .addTag('Admin - Auth', 'Xác thực admin')
    .addTag('Admin - Users', 'Quản lý người dùng (admin)')
    .addTag('Admin - Posts', 'Quản lý bài viết (admin)')
    .addTag('Admin - Comments', 'Quản lý bình luận (admin)')
    .addTag('Admin - Reports', 'Quản lý báo cáo (admin)')
    .addTag('Admin - Dashboard', 'Thống kê (admin)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
