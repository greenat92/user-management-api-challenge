import { DataSource } from 'typeorm';
import { User } from '../../src/users/user.entity'; // Adjust the import path as necessary
import * as bcrypt from 'bcryptjs';

export class SeedHelper {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async initialize(): Promise<void> {
    await this.dataSource.initialize();
  }

  async destroy(): Promise<void> {
    await this.dataSource.destroy();
  }

  async createUser(username: string, password: string): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);

    const existingUser = await userRepository.findOneBy({ username });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.username = username;
    user.password = hashedPassword;

    return userRepository.save(user);
  }

  async updateUser(
    username: string,
    newUsername?: string,
    newPassword?: string,
  ): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);

    const user = await userRepository.findOneBy({ username });
    if (!user) {
      throw new Error('User not found');
    }

    if (newUsername) {
      user.username = newUsername;
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    return userRepository.save(user);
  }

  async clearUsers(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    await userRepository.clear();
  }
}
