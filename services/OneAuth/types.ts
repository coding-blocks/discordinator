export interface IOneAuthProps {
  accessCookie?: string;
  accessToken?: string;
}

export interface IOneAuthUser {
  id: number;
  userdiscord?: {
    id: string;
  };
}

export interface IOneAuthProfile {
  id: number;
  userdiscord?: {
    id: string;
    refreshToken: string;
  };
}

export interface IWithAccessCookie {
  headers: {
    Cookie: string;
  };
}

export interface IWithAccessToken {
  headers: {
    Authorization: string;
  };
}

export interface IWithClientToken {
  headers: {
    Authorization: string;
  };
}

export interface IVerifyAuthCodeResult {
  access_token: string;
}

export interface IRequestOptions {
  method?: 'GET' | 'POST';
  headers?: { [key: string]: any };
  body?: any;
}
