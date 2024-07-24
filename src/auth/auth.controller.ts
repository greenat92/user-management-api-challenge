// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import {
  LoginRes,
  RefreshTokenRes,
  RegisterRes,
} from 'src/swagger/schema/auth.schema';
import { ErrorSchema } from 'src/swagger/schema/error.schema';
import { SuccessNoContent } from 'src/swagger/schema/common.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: RegisterRes,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username already exists',
    type: ErrorSchema,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'username and password are required with valid format',
    type: ErrorSchema,
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: LoginRes,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    type: ErrorSchema,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'username and password are required with valid format',
    type: ErrorSchema,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'no username with this credentials',
    type: ErrorSchema,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully logged out',
    type: SuccessNoContent,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You should provide access token',
    type: ErrorSchema,
  })
  @ApiBearerAuth()
  async logout(@Req() req: Request) {
    await this.authService.logout(req.user['id']);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token and refresh token successfully refreshed',
    type: RefreshTokenRes,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
    type: ErrorSchema,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'refresh token is required',
    type: ErrorSchema,
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
