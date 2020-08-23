import fetch from 'node-fetch';
import config from '~/config';
import * as Sentry from '@sentry/node';
import { IRequestOptions } from './types';

export const request = async (url: string, options: IRequestOptions = {}): Promise<any> => {
  try {
    const res = await fetch(config.oneauth.url + url, {
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
    Sentry.captureException(err);
    return null;
  }
};
