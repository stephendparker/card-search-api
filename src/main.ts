import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // ✅ Allow frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // ✅ Allow these HTTP methods
    credentials: true, // ✅ Allow cookies/auth headers if needed
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
