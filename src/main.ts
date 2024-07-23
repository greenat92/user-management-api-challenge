import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // Global middleware
  app.use(helmet());

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription(
      'API for managing user registration, authentication, and profile management',
    )
    .setVersion('1.0')
    .addServer(process.env.APP_URL || 'http://localhost:3000/')
    .addBearerAuth() // Adds the bearer token authorization option
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
