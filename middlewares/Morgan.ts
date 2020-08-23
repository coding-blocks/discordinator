import * as chalk from 'chalk';
import * as morgan from 'morgan';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';

@Middleware({ type: 'before' })
export class MorganMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err?: any) => any): void {
    const send = response.send.bind(response);
    let body;

    response.send = (data) => {
      body = data;
      send(data);
    };

    next();

    morgan((tokens, req, res) => {
      const log = [];
      const pushColorized = (color = 'white', data) => log.push(chalk[color](data));

      const method = tokens.method(req, res);
      const pushMethod = (color) => pushColorized(color, method);
      switch (method) {
        case 'HEAD':
          pushMethod('yellow');
          break;
        case 'GET':
          pushMethod('green');
          break;
        case 'POST':
          pushMethod('magenta');
          break;
        case 'PUT':
          pushMethod('magenta');
          break;
        case 'PATCH':
          pushMethod('magenta');
          break;
        case 'OPTIONS':
          pushMethod('blue');
          break;
        case 'DELETE':
          pushMethod('red');
          break;
      }

      log.push(tokens.url(req, res));

      const status = tokens.status(req, res);
      const pushStatus = (color) => pushColorized(color, status);
      if (status < 400) {
        pushStatus('green');
      } else if (status < 500) {
        pushStatus('yellow');
      } else {
        pushStatus('red');
      }

      log.push(
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
      );
      log.push(`request: ${JSON.stringify(req.body || {})}`);
      log.push(`response: ${JSON.stringify(body || {})}`);

      return log.join(' ');
    })(request, response, () => {});
  }
}
