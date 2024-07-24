// user Interface
export interface IUser {
  id: number;
  username: string;
  password: string;
  refreshToken?: string;
  created_at: Date;
  updated_at: Date;
}

// dots
export interface IUserMeUpdateDto {
  newUsername?: string;
  oldPassword?: string;
  newPassword?: string;
}
// response
export interface IUserMeRes {
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserUpdateMeRes {
  username: string;
  updateAt: Date;
}
