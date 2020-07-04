import request from 'node-fetch';
import config from '~/config';

export class OneAuth {
  #accessToken?: string;

  constructor(accessToken?: string) {
    this.#accessToken = accessToken;
  }

  private fetch(url: string, options?: any) {
    return request(config.oneauth.url + url, options);
  }

  private get accessHeaders(): any {
    return this.#accessToken && { headers: { Cookie: `oneauth=${this.#accessToken}` } };
  }

  async me(): Promise<any> {
    try {
      const res = await this.fetch('/api/users/me?include=discord', this.accessHeaders);
      if (res.ok) return await res.json();
    } catch (err) {
      console.log(err);
    }
  }
}
