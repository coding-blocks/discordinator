import config from '~/config';
import { query } from '~/utils/query';
import { request } from './request';
import {
  IOneAuthProps,
  IOneAuthUser,
  IOneAuthProfile,
  IWithAccessCookie,
  IWithAccessToken,
  IWithClientToken,
  IVerifyAuthCodeResult,
} from './types';

export { IOneAuthProps, IOneAuthProfile };

const {
  oneauth: { clientId, clientSecret },
} = config;

export class OneAuth {
  #accessCookie?: string;
  #accessToken?: string;

  constructor({ accessCookie = null, accessToken = null }: IOneAuthProps) {
    this.#accessCookie = accessCookie;
    this.#accessToken = accessToken;
  }

  private get withAccessCookie(): IWithAccessCookie | null {
    return this.#accessCookie && { headers: { Cookie: `oneauth=${this.#accessCookie}` } };
  }

  private get withAccessToken(): IWithAccessToken | null {
    return this.#accessToken && { headers: { Authorization: `Bearer ${this.#accessToken}` } };
  }

  private get withClientToken(): IWithClientToken {
    return OneAuth.withClientToken;
  }

  private static get withClientToken(): IWithClientToken {
    return {
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
    };
  }

  me(): Promise<IOneAuthUser | null> | null {
    return (
      (this.withAccessCookie || this.withAccessToken) &&
      request('/api/users/me?include=discord', this.withAccessCookie || this.withAccessToken)
    );
  }

  static connect(): string {
    return (
      config.oneauth.url +
      '/connect/discord' +
      query({
        returnTo: config.app.url + '/app/connect/',
      })
    );
  }

  static getProfile(oneauthId): Promise<IOneAuthProfile | null> | null {
    return request(`/api/users/${oneauthId}?include=discord`, OneAuth.withClientToken);
  }

  static login(): string {
    return (
      config.oneauth.url +
      '/oauth/authorize' +
      query({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: config.app.url + '/app/connect/callback',
      })
    );
  }

  static async verifyLogin(code: string): Promise<IOneAuthProfile | null> {
    const res: IVerifyAuthCodeResult | null = await request('/oauth/token', {
      method: 'POST',
      body: {
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: config.app.url + '/app/connect/callback',
      },
    });

    if (!res) return null;

    const user = await new OneAuth({ accessToken: res.access_token }).me();
    const profile = await OneAuth.getProfile(user.id);

    return profile;
  }
}
