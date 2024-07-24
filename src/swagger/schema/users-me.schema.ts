import { ApiProperty } from '@nestjs/swagger';
import { IUserMeRes, IUserUpdateMeRes } from '../../users/users.interface';

// response
export class UserMeRes implements IUserMeRes {
  @ApiProperty({ type: 'string' })
  username: string;
  @ApiProperty({ type: 'string' })
  createdAt: Date;
  @ApiProperty({ type: 'string' })
  updatedAt: Date;
}

export class UserUpdateMeRes implements IUserUpdateMeRes {
  @ApiProperty({ type: 'string' })
  username: string;
  @ApiProperty({ type: 'string' })
  updateAt: Date;
}
