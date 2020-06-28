import dotenv = require('dotenv');
dotenv.config();
import 'reflect-metadata';
import 'module-alias/register';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { createConnection } from 'typeorm';
import { useExpressServer } from 'routing-controllers';
import { AuthorizationMiddleware } from '~/middlewares/Authorization';
import config from '~/config';

const start = async () => {
  const app = express();

  // db connection
  await createConnection();

  // middewares
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compression());

  // add controllers
  useExpressServer(app, {
    routePrefix: '/api',
    controllers: [__dirname + '/controllers/**/*.ts'],
    middlewares: [AuthorizationMiddleware],
    validation: true,
  });

  app.listen(config.app.port, config.app.host, async () => {
    console.log(`Started server at http://${config.app.host}:${config.app.port}`);
  });
};

start();
