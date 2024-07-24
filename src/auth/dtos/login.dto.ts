import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ILoginBodyDto } from '../auth.interface';

export class LoginDto implements ILoginBodyDto {
  @ApiProperty({ description: 'Username for login' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password for login' })
  @IsString()
  password: string;
}
