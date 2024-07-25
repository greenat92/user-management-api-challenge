import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { CustomLogger } from '../shared/custom-logger/custom-logger.service';
import {
  ILoginBodyDto,
  ILoginRes,
  IRefreshTokenBodyDto,
  IRefreshTokenRes,
  IRegisterBodyDto,
  IRegisterRes,
} from './auth.interface';
import { IUser } from '../users/users.interface';
import { BlacklistedTokensService } from './blacklisted-tokens.service';
import { UserCacheService } from '../shared/services/cache/user-cache.service';

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly blacklistedTokensService: BlacklistedTokensService,
    private readonly userCacheService: UserCacheService,
  ) {}

  async register(registerBodyDto: IRegisterBodyDto): Promise<IRegisterRes> {
    const { username, password } = registerBodyDto;
    const existingUser = await this.usersService.findUserByUsername(username);
    if (existingUser) {
      this.logger.error('Username already exists');
      throw new ConflictException('Username already exists');
    }

    // create the user and save it in the database
    const user = await this.usersService.createUser(username, password);
    // add user to cache
    this.userCacheService.setUserCache(user.username, user);
    return {
      username: user.username,
      createdAt: user.created_at,
    };
  }

  async login(loginBodyDto: ILoginBodyDto): Promise<ILoginRes> {
    const { username, password } = loginBodyDto;

    let user: Partial<IUser> | undefined;

    // fetch user from cache
    user = await this.userCacheService.getUserCache(username);

    // user is not in the cache
    if (!user) {
      // get user from database
      user = await this.usersService.findUserByUsername(username);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    this.logger.log(`Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      this.logger.error('Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.id, user.username);
    const refreshToken = this.generateRefreshToken(user.id, user.username);

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

      // invalidate the cache
      this.userCacheService.invalidateUserCache(user.username);

      // this is just a an example how to handel it in real product we should provide a propre solution
      // Add access token to blacklist (for this example, we'll need the token)
      // In practice, you might need to handle this differently
      const tokens = [
        this.generateAccessToken(user.id, user.username),
        this.generateRefreshToken(user.id, user.username),
      ];
      tokens.forEach((token) => this.blacklistedTokensService.addToken(token));
    }
  }

  async refreshToken(
    refreshTokenBody: IRefreshTokenBodyDto,
  ): Promise<IRefreshTokenRes> {
    const { refreshToken } = refreshTokenBody;

    // Decode the refresh token to get the payload
    let decodedToken: any;
    try {
      decodedToken = jwt.decode(refreshToken) as { username: string };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!decodedToken || !decodedToken.username) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findUserByUsername(
      decodedToken?.username,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.generateAccessToken(user.id, user.username);
    const newRefreshToken = this.generateRefreshToken(user.id, user.username);

    await this.usersService.setRefreshToken(user.id, newRefreshToken);

    // update user cache
    this.userCacheService.setUserCache(user.username, {
      ...user,
      refreshToken: newRefreshToken,
      updated_at: new Date(),
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  private generateAccessToken(userId: number, username): string {
    return jwt.sign(
      { userId, username },
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      { expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME') },
    );
  }

  private generateRefreshToken(userId: number, username: string): string {
    return jwt.sign(
      { userId, username },
      this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      {
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRE_TIME'),
      },
    );
  }
}
