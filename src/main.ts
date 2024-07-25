import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as winston from 'winston';
import * as os from 'os';
import { utilities, WinstonModule } from 'nest-winston';

import { Environment } from './shared/enums/env.enum';
import { typeOrmConfig } from './config/database.config';
import { ConfigService } from '@nestjs/config';

const appName = process.env.APP_NAME || 'management and auth service api';

async function bootstrap() {
  const winstonFormats: winston.Logform.Format[] = [
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ',
    }),
    winston.format.json(),
  ];

  if (process.env.APP_ENV == Environment.Local) {
    winstonFormats.push(
      utilities.format.nestLike(appName, { prettyPrint: true }),
    );
  }

  const logger = WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(...winstonFormats),
    defaultMeta: {
      app: appName,
      host: os.hostname(),
      env: process.env.APP_ENV,
    },
    transports: [new winston.transports.Console()],
  });

  const app = await NestFactory.create(AppModule.withTypeOrm(typeOrmConfig), {
    bufferLogs: true,
    logger: logger,
  });
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription(
      'API for managing user registration, authentication, and profile management',
    )
    .setVersion('1.0')
    .addServer(process.env.APP_URL || 'http://localhost:3000/')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
