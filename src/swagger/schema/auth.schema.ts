import { ApiProperty } from '@nestjs/swagger';
import {
  IRefreshTokenRes,
  IRegisterRes,
  ILoginRes,
} from '../../auth/auth.interface';

// response
export class RefreshTokenRes implements IRefreshTokenRes {
  @ApiProperty({ type: 'string' })
  accessToken: string;
  @ApiProperty({ type: 'string' })
  refreshToken: string;
}

export class RegisterRes implements IRegisterRes {
  @ApiProperty({ type: 'string' })
  username: string;
  @ApiProperty({ type: 'string' })
  createdAt: Date;
}

export class LoginRes implements ILoginRes {
  @ApiProperty({ type: 'string' })
  username: string;
  @ApiProperty({ type: 'string' })
  accessToken: string;
  @ApiProperty({ type: 'string' })
  refreshToken: string;
  @ApiProperty({ type: 'string' })
  createdAt: Date;
  @ApiProperty({ type: 'string' })
  updatedAt: Date;
}
