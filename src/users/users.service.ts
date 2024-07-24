import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private entityManager: EntityManager,
  ) {}

  async createUser(username: string, password: string): Promise<IUser> {
    const existingUser = await this.findUserByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findUserByUsername(username: string): Promise<IUser | undefined> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findUserById(id: number): Promise<IUser> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async saveUser(user: IUser): Promise<IUser> {
    return await this.usersRepository.save(user);
  }
  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(User)
        .set({ refreshToken })
        .where('id = :userId', { userId })
        .execute();
    });
  }

  async removeRefreshToken(userId: number): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(User)
        .set({ refreshToken: null })
        .where('id = :userId', { userId })
        .execute();
    });
  }

  async findUserByRefreshToken(
    refreshToken: string,
  ): Promise<IUser | undefined> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.refreshToken = :refreshToken', { refreshToken })
      .getOne();
  }
}
