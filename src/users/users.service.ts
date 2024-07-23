import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private entityManager: EntityManager,
  ) {}

  async createUser(username: string, password: string): Promise<User> {
    const existingUser = await this.findUserByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ username, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findUserById(id: number): Promise<User> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async updateUser(id: number, newUsername: string, oldPassword: string, newPassword: string): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (newUsername) {
      const existingUserWithNewUsername = await this.findUserByUsername(newUsername);
      if (existingUserWithNewUsername && existingUserWithNewUsername.id !== id) {
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

    return this.usersRepository.save(user);
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.entityManager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(User)
        .set({ refreshToken })
        .where('id = :userId', { userId })
        .execute();
    });
  }

  async removeRefreshToken(userId: number): Promise<void> {
    await this.entityManager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(User)
        .set({ refreshToken: null })
        .where('id = :userId', { userId })
        .execute();
    });
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User | undefined> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.refreshToken = :refreshToken', { refreshToken })
      .getOne();
  }
}
