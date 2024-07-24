import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { UpdateMeUserDto } from './dtos/update-user.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsersMeService } from './users-me.service';
import { UserMeRes, UserUpdateMeRes } from '../swagger/schema/users-me.schema';
import { ErrorSchema } from 'src/swagger/schema/error.schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersMeService: UsersMeService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserMeRes,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User profile retrieved successfully',
    type: ErrorSchema,
  })
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    const userId = req.user['id']; // Extracted from the JWT token
    return this.usersMeService.getUserMe(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
    type: UserUpdateMeRes,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User profile retrieved successfully',
    type: ErrorSchema,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data or old password incorrect',
    type: ErrorSchema,
  })
  @ApiBearerAuth()
  async updateMe(@Req() req: Request, @Body() updateUserDto: UpdateMeUserDto) {
    const userId = req.user['id']; // Extracted from the JWT token
    return this.usersMeService.updateUserMe(userId, updateUserDto);
  }
}
