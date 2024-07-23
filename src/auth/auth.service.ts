import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async register(
    username: string,
    password: string,
  ): Promise<{ username: string; createAt: Date }> {
    // Check if username already exists
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
    });
    return {
      username: user.username,
      createAt: new Date(),
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
    // Find user by username
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token in the database
    await this.usersRepository.update(user.id, { refreshToken });

    return {
      username: user.username,
      accessToken,
      refreshToken,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async logout(userId: number): Promise<void> {
    // Remove refresh token
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Find user by refresh token
    const user = await this.usersRepository.findOne({
      where: { refreshToken },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const accessToken = this.generateAccessToken(user.id);
    const newRefreshToken = this.generateRefreshToken(user.id);

    // Update refresh token in the database
    await this.usersRepository.update(user.id, {
      refreshToken: newRefreshToken,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  private generateAccessToken(userId: number): string {
    return jwt.sign(
      { userId },
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      { expiresIn: '30m' },
    );
  }

  private generateRefreshToken(userId: number): string {
    return jwt.sign(
      { userId },
      this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      { expiresIn: '7d' },
    );
  }
}
