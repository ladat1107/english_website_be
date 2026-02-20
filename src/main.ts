import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('v1/api', { exclude: [''] });

  // Parse cookies
  app.use(cookieParser());

  app.enableCors({
    origin: configService.get<string>('auth.frontendUrl'),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  const port = configService.get('app.port');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Truyền thừa thuộc tính tự động bị loại bỏ
    forbidNonWhitelisted: false, // Nếu có thuộc tính không hợp lệ, khong ném lỗi
    transform: true, // Tự động chuyển đổi payload thành các kiểu dữ liệu mong muốn trong DTO
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(port ?? 8080);
}
bootstrap();
