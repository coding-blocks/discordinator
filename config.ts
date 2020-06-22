export default {
  app: {
    port: Number(process.env.APP_PORT) || 5050,
    host: process.env.APP_HOST || 'localhost',
    secret: process.env.APP_SECRET || 'codingblocks',
  },
};
