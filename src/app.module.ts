import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@shared/services/cache/cache.module';

// global module -> all DI mappings specified here are available in all modules@Global()
@Global()
@Module({})
export class AppModule implements NestModule {
  static withTypeOrm(typeOrmConfig: TypeOrmModuleOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        // Core Modules
        ConfigModule.forRoot({
          isGlobal: true, // make ConfigModule global
          envFilePath: ['.env', `.env.${process.env.NODE_ENV}`], // load environment file based on NODE_ENV
          expandVariables: true, // expand variables in .env file
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (
            configService: ConfigService,
          ): Promise<TypeOrmModuleOptions> => {
            const config = {
              ...typeOrmConfig,
              ...configService.get('DATABASE_CONFIG'),
            };

            return config as TypeOrmModuleOptions;
          },
          inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        CacheModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer) {}
}
