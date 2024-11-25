import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IRegisterBodyDto } from '../auth.interface';

export class RegisterDto implements IRegisterBodyDto {
  @ApiProperty({ description: 'Username for registration' })
  @IsString()
  @MinLength(4, {
    message: 'Username is too short. Minimum length is 4 characters.',
  })
  @MaxLength(100, {
    message: 'Username is too long. Maximum length is 100 characters.',
  })
  username: string;

  @ApiProperty({ description: 'Password for registration' })
  @IsString()
  @MinLength(6, {
    message: 'Password is too short. Minimum length is 6 characters.',
  })
  password: string;
}
