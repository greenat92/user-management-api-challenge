import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { PerformanceMeasureHelper } from './shared/helpers/performance-measure.helper';
import * as winston from 'winston';
import * as os from 'os';
import { utilities, WinstonModule } from 'nest-winston';

import { Environment } from './shared/enums/env.enum';
import { CustomLogger } from './shared/custom-logger/custom-logger.service';

const appName = process.env.APP_NAME || 'management and auth service api';

// load env variables stored in project root
ConfigModule.forRoot({
  envFilePath: ['../.env'],
  expandVariables: true,
});

// subscribe to performance measures to log measured performance values
// ! must be called after config module was initialized, as the this helper also accesses env variables
PerformanceMeasureHelper.initObserver();

async function bootstrap() {
  const pmBootstrap = new PerformanceMeasureHelper('main | bootstrap', true);
  // define format of log messages
  const pmLogging = new PerformanceMeasureHelper('main | logging setup', true);
  // ! do not change the order of the formats, otherwise one format might overwrite the other
  const winstonFormats: winston.Logform.Format[] = [
    // 1. add timestamp to each log message
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ',
    }),
    // 2. format log messages as json objects
    winston.format.json(),
  ];

  if (process.env.APP_ENV == Environment.Local) {
    // on localhost, pretty print the log messages using the nest-libraries
    // ! this must only be applied on localhost execution, otherwise this will screw up our logging-extension.
    winstonFormats.push(
      utilities.format.nestLike(appName, { prettyPrint: true }),
    );
  }

  // create logger being used by NestJS and the CustomLogger
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
  pmLogging.end();

  // setup nestjs using custom winston logger
  const pmNestjsSetup = new PerformanceMeasureHelper(
    'main | nestjs setup',
    true,
  );
  const pmNestjsAppCreate = new PerformanceMeasureHelper(
    'main | nestjs app create',
    true,
  );
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    // use winston as nestjs-logger -> logs during bootstrap will also be logged to winston
    logger: logger,
  });
  const configService = app.get(ConfigService);

  const pmNestjsAppConfig = new PerformanceMeasureHelper(
    'main | nestjs app config',
    true,
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  pmNestjsAppCreate.end();

  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  // handle unhandled promise rejections
  process.on('unhandledRejection', (error: Error) => {
    // log unhandled promise rejection to prevent app from crashing
    const logger = new CustomLogger('process', 'onUnhandledRejection');
    logger.error(error);
  });

  process.on('uncaughtException', (error: Error) => {
    // log uncaught exception to prevent app from crashing
    const logger = new CustomLogger('process', 'onUncaughtException');
    logger.error(error);
  });

  // set timezone to UTC
  process.env.TZ = 'Etc/UTC';

  pmNestjsAppConfig.end();

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
  const pmSwagger = new PerformanceMeasureHelper('main | swagger setup', true);
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

  const pmNestjsAppListen = new PerformanceMeasureHelper(
    'main | nestjs app listen',
    true,
  );
  pmSwagger.end();

  await app.listen(configService.get<number>('PORT') || 3000);
  pmNestjsAppListen.end();
  pmNestjsSetup.end();
  pmBootstrap.end();
}
bootstrap();
