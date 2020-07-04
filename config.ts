export default {
  app: {
    port: Number(process.env.APP_PORT) || 5050,
    host: process.env.APP_HOST || 'localhost',
    secret: process.env.APP_SECRET || 'codingblocks',
  },
  oneauth: {
    url: process.env.ONEAUTH_URL || 'https://account.codingblocks.com',
    clientId: process.env.ONEAUTH_CLIENT_ID,
    clientSecret: process.env.ONEAUTH_CLIENT_SECRET,
  },
};
