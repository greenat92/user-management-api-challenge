// src/users/users.controller.ts
import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    const userId = req.user['id']; // Extracted from the JWT token
    return this.usersService.userMe(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or old password incorrect',
  })
  @ApiBearerAuth()
  async updateMe(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user['id']; // Extracted from the JWT token
    const { username, newPassword } = updateUserDto;

    // Extract old password from request if provided
    const oldPassword = req.body?.oldPassword; // Make sure the client sends oldPassword in the request body

    return this.usersService.updateUser(
      userId,
      username,
      oldPassword,
      newPassword,
    );
  }
}
