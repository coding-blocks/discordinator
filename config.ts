export default {
  app: {
    port: Number(process.env.APP_PORT) || 5050,
    host: process.env.APP_HOST || '127.0.0.1',
    url: process.env.APP_URL || 'http://127.0.0.1:5050',
    secret: process.env.APP_SECRET || 'codingblocks',
  },
  oneauth: {
    url: process.env.ONEAUTH_URL || 'https://account.codingblocks.com',
    clientId: Number(process.env.ONEAUTH_CLIENT_ID),
    clientSecret: process.env.ONEAUTH_CLIENT_SECRET,
  },
  online: {
    url: process.env.ONLINE_URL || 'https://online.codingblocks.com',
  },
};
