import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IUserMeUpdateDto } from '../users.interface';

export class UpdateMeUserDto implements IUserMeUpdateDto {
  @ApiProperty({ description: 'New username for the user', required: false })
  @IsString()
  @MinLength(4, {
    message: 'Username is too short. Minimum length is 4 characters.',
  })
  @MaxLength(100, {
    message: 'Username is too long. Maximum length is 100 characters.',
  })
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'Old password for the user', required: false })
  @IsString()
  @MinLength(6, {
    message: 'oldPassword is too short. Minimum length is 6 characters.',
  })
  @IsOptional()
  oldPassword?: string;

  @ApiProperty({ description: 'New password for the user', required: false })
  @IsString()
  @MinLength(6, {
    message: 'newPassword is too short. Minimum length is 6 characters.',
  })
  @IsOptional()
  newPassword?: string;
}
