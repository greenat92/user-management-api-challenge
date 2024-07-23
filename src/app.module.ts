// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from './config/database.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const dbConfig = configService.get('DATABASE_CONFIG') || {};
        return {
          ...typeOrmConfig,
          ...dbConfig,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
})
export class AppModule {}
