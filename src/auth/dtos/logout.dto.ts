import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ description: 'JWT access token for logout' })
  @IsString()
  accessToken: string;
}
