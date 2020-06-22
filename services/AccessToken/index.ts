import config from '~/config';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export interface IAccessTokenGenerateProps {
  aud: string;
}

export interface IAccessTokenVerifyProps {
  readonly aud?: string;
  readonly jti?: string;
}

export interface IAccessTokenPayload {
  readonly aud: string;
  readonly jti: string;
  readonly iat: number;
}

export interface IAccessTokenProps extends IAccessTokenPayload {
  readonly verified: boolean;
  readonly value: string;
}

export class AccessToken implements IAccessTokenProps {
  static generate({ aud }: IAccessTokenGenerateProps): AccessToken {
    const payload: IAccessTokenPayload = {
      aud,
      jti: uuid(),
      iat: Number(new Date()),
    };

    const value = jwt.sign(payload, config.app.secret);

    return new AccessToken({ value, verified: true, ...payload });
  }

  static decode(token: string): AccessToken {
    const payload: IAccessTokenPayload = jwt.decode(token);

    return new AccessToken({ value: token, verified: false, ...payload });
  }

  static verify(token: string, payload?: IAccessTokenVerifyProps): AccessToken {
    const decoded = AccessToken.decode(token);
    decoded.verify();

    return decoded;
  }

  constructor({ verified, ...props }: IAccessTokenProps) {
    Object.assign(this, props);

    this._verified = verified;
  }

  readonly aud: string;
  readonly jti: string;
  readonly iat: number;
  readonly value: string;

  private _error: any;
  private _verified: boolean;

  get error(): any {
    return this._error;
  }

  get verified(): boolean {
    return this._verified;
  }

  verify(checks?: IAccessTokenVerifyProps): boolean {
    try {
      if (this.verified) return true;

      if (checks) {
        const err = Object.keys(checks).reduce(
          (failed, prop) =>
            failed || (checks[prop] !== this[prop] ? { name: `${prop}Mismatch` } : failed),
          null,
        );

        if (err) {
          this._error = err;
          return false;
        }
      }

      jwt.verify(this.value, config.app.secret);
      this._verified = true;

      return true;
    } catch (err) {
      this._error = err;
      return false;
    }
  }
}
