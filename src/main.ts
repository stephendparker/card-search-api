import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const allowedOrigins = [
    configService.get<string>('FRONTEND_URL'),
    configService.get<string>('PRODUCTION_FRONTEND_URL'),
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // ✅ Allow these HTTP methods
    credentials: true, // ✅ Allow cookies/auth headers if needed
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
