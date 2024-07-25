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
import { UserCacheService } from '../shared/services/cache/user-cache.service';
import { IUser } from './users.interface';

@Injectable()
export class UsersMeService {
  constructor(
    private usersService: UsersService,
    private readonly userCacheService: UserCacheService,
  ) {}

  // UserMe methods
  async getUserMe(username: string): Promise<IUserMeRes> {
    let existingUser: Partial<IUser> | undefined;

    // fetch user from cache
    existingUser = await this.userCacheService.getUserCache(username);

    // user is not in the cache
    if (!existingUser) {
      // get user from database
      existingUser = await this.usersService.findUserByUsername(username);
    }
    existingUser = await this.usersService.findUserByUsername(username);

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

    // Check if updatedUser has necessary properties
    if (!updatedUser || !updatedUser.username) {
      throw new ConflictException('Error updating user');
    }

    // Set cache
    this.userCacheService.setUserCache(updatedUser.username, updatedUser);

    return {
      username: updatedUser.username,
      updateAt: updatedUser.updated_at,
    };
  }
}
