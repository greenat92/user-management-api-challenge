import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IRefreshTokenBodyDto } from '../auth.interface';

export class RefreshTokenDto implements IRefreshTokenBodyDto {
  @ApiProperty({ description: 'Refresh token to be refreshed' })
  @IsString()
  refreshToken: string;
}
