import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { AccessToken } from '~/services/AccessToken';

@Middleware({ type: 'before' })
export class AuthorizationMiddleware implements ExpressMiddlewareInterface {
  use(req: any, res: any, next: (err?: any) => any): void {
    if (!req.headers.Authorization)
      return res.status(403).send({ error: { message: 'Not Authorized.' } });

    req.token = AccessToken.verify(req.headers.Authorization.replace('Token ', ''));
    next();
  }
}
