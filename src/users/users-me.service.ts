import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  IUserMeRes,
  IUserMeUpdateDto,
  IUserUpdateMeRes,
} from './users.interface';
import { UsersService } from './users.service';

@Injectable()
export class UsersMeService {
  constructor(private usersService: UsersService) {}

  // UserMe methods
  async getUserMe(id: number): Promise<IUserMeRes> {
    const existingUser = await this.usersService.findUserById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    return {
      username: existingUser.username,
      createdAt: existingUser.created_at,
      updatedAt: existingUser.updated_at,
    };
  }

  async updateUserMe(
    id: number,
    userMeUpdateDto: IUserMeUpdateDto,
  ): Promise<IUserUpdateMeRes> {
    const { newUsername, newPassword, oldPassword } = userMeUpdateDto;
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (newUsername) {
      const existingUserWithNewUsername =
        await this.usersService.findUserByUsername(newUsername);
      if (
        existingUserWithNewUsername &&
        existingUserWithNewUsername.id !== id
      ) {
        throw new ConflictException('Username already in use');
      }
      user.username = newUsername;
    }

    if (oldPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new ConflictException('Old password is incorrect');
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await this.usersService.saveUser(user);

    return {
      username: updatedUser.username,
      updateAt: updatedUser.updated_at,
    };
  }
}
