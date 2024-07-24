import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IUser } from './users.interface';

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ example: 'john_doe', description: 'The username of the user' })
  username: string;

  @Column()
  @ApiProperty({
    example: 'hashed_password',
    description: 'The hashed password of the user',
  })
  password: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'refresh_token',
    description: 'The refresh token of the user',
    required: false,
  })
  refreshToken?: string;

  @CreateDateColumn()
  @ApiProperty({
    example: '2023-07-23T00:00:00Z',
    description: 'The creation date of the user',
  })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({
    example: '2023-07-23T00:00:00Z',
    description: 'The last update date of the user',
  })
  updated_at: Date;
}
