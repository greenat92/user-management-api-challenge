import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../shared/custom-logger/custom-logger.service';
// import { BlacklistedTokensService } from './blacklisted-tokens.service';

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    // private readonly blacklistedTokensService: BlacklistedTokensService, // Inject the service
  ) {}

  async register(
    username: string,
    password: string,
  ): Promise<{ username: string; createdAt: Date }> {
    const existingUser = await this.usersService.findUserByUsername(username);
    if (existingUser) {
      this.logger.error('Username already exists');
      throw new ConflictException('Username already exists');
    }
    const user = await this.usersService.createUser(username, password);

    return {
      username: user.username,
      createdAt: user.created_at,
    };
  }

  async login(
    username: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await this.usersService.findUserByUsername(username);
    this.logger.log(`User fetched: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.error('User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    this.logger.log(`Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      this.logger.error('Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    await this.usersService.setRefreshToken(user.id, refreshToken);

    return {
      username: user.username,
      accessToken,
      refreshToken,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async logout(userId: number): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    if (user) {
      // Invalidate refresh token
      await this.usersService.removeRefreshToken(userId);

      // Add access token to blacklist (for this example, we'll need the token)
      // In practice, you might need to handle this differently
      // const tokens = [this.generateAccessToken(user.id), this.generateRefreshToken(user.id)];
      // tokens.forEach(token => this.blacklistedTokensService.addToken(token));
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.generateAccessToken(user.id);
    const newRefreshToken = this.generateRefreshToken(user.id);

    await this.usersService.setRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  private generateAccessToken(userId: number): string {
    return jwt.sign(
      { userId },
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      { expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME') },
    );
  }

  private generateRefreshToken(userId: number): string {
    return jwt.sign(
      { userId },
      this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      {
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRE_TIME'),
      },
    );
  }
}
