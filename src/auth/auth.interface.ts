// responses
export interface IRegisterRes {
  username: string;
  createdAt: Date;
}

export interface ILoginRes {
  accessToken: string;
  refreshToken: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshTokenRes {
  accessToken: string;
  refreshToken: string;
}

// dots
// It looks same with ILogin interface but it can has more attributes

export interface IRegisterBodyDto {
  username: string;
  password: string;
}

export interface ILoginBodyDto {
  username: string;
  password: string;
}

export interface IRefreshTokenBodyDto {
  refreshToken: string;
}
