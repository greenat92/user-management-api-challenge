import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { BlacklistedTokensService } from './blacklisted-tokens.service';
import { CacheModule } from '@shared/services/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ConfigModule,
    CacheModule,
  ],
  providers: [AuthService, JwtStrategy, BlacklistedTokensService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
