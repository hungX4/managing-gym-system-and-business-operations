process.env.TZ = 'Asia/Ho_Chi_Minh';
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { TransformResponseInterceptor } from './common/interceptors/response.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //global prefix
  app.setGlobalPrefix('api/v1');
  //pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Xóa các field không được khai báo trong DTO
      forbidNonWhitelisted: false,
      transform: true // NẾU CÓ FIELD LẠ -> BÁO LỖI 400 BAD REQUEST NGAY
    }),
  );
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
