import { Test, TestingModule } from '@nestjs/testing';
import { UsersMeService } from './users-me.service';
import { UsersService } from './users.service';
import { UserCacheService } from '../shared/services/cache/user-cache.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  IUser,
  IUserMeUpdateDto,
  IUserMeRes,
  IUserUpdateMeRes,
} from './users.interface';

// Mock bcryptjs methods directly
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersMeService', () => {
  let service: UsersMeService;
  let usersService: UsersService;
  let userCacheService: UserCacheService;

  const mockUser: IUser = {
    id: 1,
    username: 'testUser',
    password: 'hashedPassword',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserMeRes: IUserMeRes = {
    username: 'testUser',
    createdAt: mockUser.created_at,
    updatedAt: mockUser.updated_at,
  };

  const mockUserUpdateMeRes: IUserUpdateMeRes = {
    username: 'updatedUser',
    updateAt: mockUser.updated_at,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersMeService,
        {
          provide: UsersService,
          useValue: {
            findUserByUsername: jest.fn(),
            findUserById: jest.fn(),
            saveUser: jest.fn(),
          },
        },
        {
          provide: UserCacheService,
          useValue: {
            getUserCache: jest.fn(),
            setUserCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersMeService>(UsersMeService);
    usersService = module.get<UsersService>(UsersService);
    userCacheService = module.get<UserCacheService>(UserCacheService);
  });

  describe('getUserMe', () => {
    it('[UNIT] should return the user profile if found', async () => {
      userCacheService.getUserCache = jest.fn().mockResolvedValue(mockUser);
      usersService.findUserByUsername = jest.fn().mockResolvedValue(mockUser);

      const result = await service.getUserMe('testUser');

      expect(result).toEqual(mockUserMeRes);
      expect(userCacheService.getUserCache).toHaveBeenCalledWith('testUser');
    });

    it('[UNIT] should fetch from the database if not in cache', async () => {
      userCacheService.getUserCache = jest.fn().mockResolvedValue(undefined);
      usersService.findUserByUsername = jest.fn().mockResolvedValue(mockUser);

      const result = await service.getUserMe('testUser');

      expect(result).toEqual(mockUserMeRes);
      expect(usersService.findUserByUsername).toHaveBeenCalledWith('testUser');
    });

    it('[UNIT] should throw NotFoundException if user not found', async () => {
      userCacheService.getUserCache = jest.fn().mockResolvedValue(undefined);
      usersService.findUserByUsername = jest.fn().mockResolvedValue(undefined);

      await expect(service.getUserMe('testUser')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserMe', () => {
    it('[UNIT] should update username and password successfully', async () => {
      const updateDto: IUserMeUpdateDto = {
        newUsername: 'updatedUser',
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      // Mock method responses
      usersService.findUserById = jest.fn().mockResolvedValue(mockUser);
      usersService.findUserByUsername = jest.fn().mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Mock compare method
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword'); // Mock hash method
      usersService.saveUser = jest.fn().mockResolvedValue({
        ...mockUser,
        username: 'updatedUser',
        password: 'newHashedPassword',
      });
      userCacheService.setUserCache = jest.fn();

      const result = await service.updateUserMe(1, updateDto);

      expect(result).toEqual(mockUserUpdateMeRes);
      expect(usersService.findUserById).toHaveBeenCalledWith(1);
      expect(usersService.findUserByUsername).toHaveBeenCalledWith(
        'updatedUser',
      );
      expect(usersService.saveUser).toHaveBeenCalledWith({
        ...mockUser,
        username: 'updatedUser',
        password: 'newHashedPassword',
      });
      expect(userCacheService.setUserCache).toHaveBeenCalledWith(
        'updatedUser',
        {
          ...mockUser,
          username: 'updatedUser',
          password: 'newHashedPassword',
        },
      );
    });

    it('[UNIT] should throw ConflictException if old password is incorrect', async () => {
      const updateDto: IUserMeUpdateDto = {
        oldPassword: 'wrongOldPassword',
        newPassword: 'newPassword',
      };

      usersService.findUserById = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Mock incorrect password

      await expect(service.updateUserMe(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('[UNIT] should throw ConflictException if new username is already in use', async () => {
      const updateDto: IUserMeUpdateDto = {
        newUsername: 'existingUsername',
      };

      usersService.findUserById = jest.fn().mockResolvedValue(mockUser);
      usersService.findUserByUsername = jest
        .fn()
        .mockResolvedValue({ ...mockUser, username: 'existingUsername' });

      await expect(service.updateUserMe(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
