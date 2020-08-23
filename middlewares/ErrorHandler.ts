import * as Sentry from '@sentry/node';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error = (error: any, req: any, res: any): void => {
    Sentry.Handlers.errorHandler()(error, req, res, (err: any) => {
      console.log('Error: ', err);
      res.status(500).send({ error: { message: err.message } });
    });
  };
}
