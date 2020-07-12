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
  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
  },
  cron: {
    enabled: process.env.CRON_ENABLED === 'true',
  },
};
