import getImdbot from './src/imdbot';

getImdbot().start({
  username: process.env.BOT_USERNAME,
  password: process.env.BOT_PASSWORD,
});
