import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { IUser } from './users.interface';

// Mock bcryptjs methods directly
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: EntityManager,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('[UNIT] should throw a conflict exception if username already exists', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ username: 'test' }),
      };
      jest
        .spyOn(usersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(service.createUser('test', 'password')).rejects.toThrow(
        ConflictException,
      );
    });

    it('[UNIT] should hash the password and save the user', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      };
      jest
        .spyOn(usersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Mock bcrypt methods
      const hashedPassword = 'hashedPassword'; // Use a static value here
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const createSpy = jest
        .spyOn(usersRepository, 'create')
        .mockReturnValue({ username: 'test', password: hashedPassword } as any);

      const saveSpy = jest.spyOn(usersRepository, 'save').mockResolvedValue({
        id: 1,
        username: 'test',
        password: hashedPassword,
      } as IUser);

      const result = await service.createUser('test', 'password');

      expect(createSpy).toHaveBeenCalledWith({
        username: 'test',
        password: hashedPassword,
      });
      expect(saveSpy).toHaveBeenCalledWith({
        username: 'test',
        password: hashedPassword,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(result).toEqual({
        id: 1,
        username: 'test',
        password: hashedPassword,
      });
    });
  });

  describe('findUserByUsername', () => {
    it('[UNIT] should return the user if found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, username: 'test' }),
      };
      jest
        .spyOn(usersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findUserByUsername('test');

      expect(result).toEqual({ id: 1, username: 'test' });
    });

    it('[UNIT] should return undefined if user not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      };
      jest
        .spyOn(usersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findUserByUsername('test');

      expect(result).toBeUndefined();
    });
  });
});
