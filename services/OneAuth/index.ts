import config from '~/config';
import request from 'node-fetch';
import { query } from '~/utils/query';

const {
  oneauth: { clientId, clientSecret },
} = config;

export interface OneAuthProfile {
  id: number;
  userdiscord?: {
    id: string;
    access_token: string;
    refresh_token: string;
  };
}

interface IWithAccessCookie {
  headers: {
    Cookie: string;
  };
}

interface IWithAccessToken {
  headers: {
    Authorization: string;
  };
}

interface IWithClientToken {
  headers: {
    Authorization: string;
  };
}

interface IVerifyAccessTokenResult {
  access_token: string;
}

interface IRequestOptions {
  method?: 'GET' | 'POST';
  headers?: { [key: string]: any };
  body?: any;
}

export class OneAuth {
  #accessCookie?: string;
  #accessToken?: string;

  constructor({
    accessCookie = null,
    accessToken = null,
  }: {
    accessCookie?: string;
    accessToken?: string;
  }) {
    this.#accessCookie = accessCookie;
    this.#accessToken = accessToken;
  }

  private static async fetch(url: string, options: IRequestOptions = {}): Promise<any> {
    try {
      const res = await request(config.oneauth.url + url, {
        ...options,
        body: options.body && JSON.stringify(options.body),
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      if (res.ok) return (await res.json()) as any;
      throw res;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  private get withAccessCookie(): IWithAccessCookie | null {
    return this.#accessCookie && { headers: { Cookie: `oneauth=${this.#accessCookie}` } };
  }

  private get withAccessToken(): IWithAccessToken | null {
    return this.#accessToken && { headers: { Authorization: `Bearer ${this.#accessToken}` } };
  }

  private static get withClientToken(): IWithClientToken {
    return {
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
    };
  }

  me(): Promise<OneAuthProfile | null> | null {
    return (
      (this.withAccessCookie || this.withAccessToken) &&
      OneAuth.fetch('/api/users/me?include=discord', this.withAccessCookie || this.withAccessToken)
    );
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

  static async verifyLogin(code: string): Promise<OneAuthProfile | null> {
    const res: IVerifyAccessTokenResult | null = await OneAuth.fetch('/oauth/token', {
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

    return await new OneAuth({ accessToken: res.access_token }).me();
  }

  static connect(oneauthId): string {
    return (
      config.oneauth.url +
      '/connect/discord' +
      query({
        returnTo: config.app.url + '/app/connect/success/' + oneauthId,
      })
    );
  }

  static getProfile(oneauthId): Promise<OneAuthProfile | null> | null {
    return OneAuth.fetch(`/api/users/${oneauthId}?include=discord`, OneAuth.withClientToken);
  }
}
