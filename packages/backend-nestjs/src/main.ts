process.env.TZ = 'Asia/Ho_Chi_Minh';
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //global prefix
  app.setGlobalPrefix('api/v1');
  //pipe
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // Xóa các field không được khai báo trong DTO
  //     forbidNonWhitelisted: true, // NẾU CÓ FIELD LẠ -> BÁO LỖI 400 BAD REQUEST NGAY
  //   }),
  // );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
