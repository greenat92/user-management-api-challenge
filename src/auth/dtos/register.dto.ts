import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username for registration' })
  @IsString()
  @MinLength(4, {
    message: 'Username is too short. Minimum length is 4 characters.',
  })
  @MaxLength(20, {
    message: 'Username is too long. Maximum length is 20 characters.',
  })
  username: string;

  @ApiProperty({ description: 'Password for registration' })
  @IsString()
  @MinLength(6, {
    message: 'Password is too short. Minimum length is 6 characters.',
  })
  password: string;
}
