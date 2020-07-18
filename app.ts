import dotenv = require('dotenv');
dotenv.config();
import 'reflect-metadata';
import 'module-alias/register';
import * as express from 'express';
import { Cron } from '~/services/Cron';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { createConnection } from 'typeorm';
import { useExpressServer } from 'routing-controllers';
import { useMiddeware } from '~/utils/useMiddeware';
import { AuthorizationMiddleware } from '~/middlewares/Authorization';
import config from '~/config';
import { Discord } from '~/services/Discord';

const start = async () => {
  const app = express();

  // db connection
  await createConnection();
  console.log('Database connection established.');

  // init discord client
  await Discord.initialize();
  console.log('Discord client initialized.');

  // middewares
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compression());

  // add api controllers
  app.use('/api', useMiddeware(AuthorizationMiddleware));
  useExpressServer(app, {
    routePrefix: '/api',
    controllers: [__dirname + '/controllers/api/**/*.ts'],
    validation: true,
  });

  // add app controllers
  useExpressServer(app, {
    routePrefix: '/app',
    controllers: [__dirname + '/controllers/app/**/*.ts'],
    validation: true,
  });

  app.listen(config.app.port, config.app.host, async () => {
    console.log(`Started server at http://${config.app.host}:${config.app.port}`);
  });

  config.cron.enabled && Cron.initialize();
};

start();
