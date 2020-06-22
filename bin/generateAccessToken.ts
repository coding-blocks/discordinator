import dotenv = require('dotenv');
dotenv.config();
import 'reflect-metadata';
import 'module-alias/register';
import { argv } from 'yargs';
import { AccessToken } from '~/services/AccessToken';

console.log(AccessToken.generate({ aud: argv.audience }));
