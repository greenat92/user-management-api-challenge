import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersMeService } from './users-me.service';
import { Request } from 'express';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UpdateMeUserDto } from './dtos/update-user.dto';
import { IUserMeRes, IUserUpdateMeRes } from './users.interface';

// Mock the UsersMeService
const mockUsersMeService = {
  getUserMe: jest.fn(),
  updateUserMe: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersMeService: UsersMeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersMeService,
          useValue: mockUsersMeService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersMeService = module.get<UsersMeService>(UsersMeService);
  });

  describe('getMe', () => {
    it('[UNIT] should return the user profile if found', async () => {
      const mockUserProfile: IUserMeRes = {
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersMeService.getUserMe = jest
        .fn()
        .mockResolvedValue(mockUserProfile);

      const req = {
        user: {
          username: 'testuser',
        },
      } as unknown as Request;

      const result = await controller.getMe(req);

      expect(result).toEqual(mockUserProfile);
      expect(mockUsersMeService.getUserMe).toHaveBeenCalledWith('testuser');
    });

    it('[UNIT] should handle unauthorized access', async () => {
      const req = {
        user: null,
      } as unknown as Request;

      await expect(controller.getMe(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateMe', () => {
    it('[UNIT] should successfully update the user profile', async () => {
      const updateUserDto: UpdateMeUserDto = {
        username: 'newusername',
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const mockUpdatedUser: IUserUpdateMeRes = {
        username: 'newusername',
        updateAt: new Date(),
      };
      mockUsersMeService.updateUserMe = jest
        .fn()
        .mockResolvedValue(mockUpdatedUser);

      const req = {
        user: {
          id: 1,
        },
      } as unknown as Request;

      const result = await controller.updateMe(req, updateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersMeService.updateUserMe).toHaveBeenCalledWith(
        1,
        updateUserDto,
      );
    });

    it('[UNIT] should handle invalid data or incorrect old password', async () => {
      const updateUserDto: UpdateMeUserDto = {
        username: 'newusername',
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };
      mockUsersMeService.updateUserMe = jest.fn().mockRejectedValue({
        response: 'Old password is incorrect',
        status: HttpStatus.BAD_REQUEST,
      });

      const req = {
        user: {
          id: 1,
        },
      } as unknown as Request;

      try {
        await controller.updateMe(req, updateUserDto);
      } catch (error) {
        expect(error.response).toEqual('Old password is incorrect');
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('[UNIT] should handle unauthorized access', async () => {
      const updateUserDto: UpdateMeUserDto = {
        username: 'newusername',
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const req = {
        user: null,
      } as unknown as Request;

      await expect(controller.updateMe(req, updateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
