import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with explicit configuration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // Get port from environment or use default
  const port = parseInt(process.env.PORT || '8002');

  await app.listen(port);
  console.log(`NestJS server running on http://localhost:${port}`);
}
bootstrap();
