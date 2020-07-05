import { ExpressMiddlewareInterface } from 'routing-controllers';
import { AccessToken } from '~/services/AccessToken';

export class AuthorizationMiddleware implements ExpressMiddlewareInterface {
  use(req: any, res: any, next: (err?: any) => any): void {
    if (!req.headers.authorization)
      return res.status(403).send({ error: { message: 'Not Authorized.' } });

    req.token = AccessToken.verify(req.headers.authorization.replace('Bearer ', ''));

    if (!req.token.verified) return res.status(403).send({ error: { message: 'Not Authorized.' } });

    next();
  }
}
