import _ from 'lodash';

export default (bot, messages, target) => {
  const msgDelay = 200;

  const sendMessage = (message) => {
    if (message) {
      if (target) {
        bot.call('chat.whisper', {
          target,
          message,
        });
      } else {
        bot.call('chat.post', {
          message: `#${process.env.BROADCAST_CHANNEL} ${message}`,
        });
      }
    }
  };

  // This converts '#' in message into backslash escaped to get around ttn server filtering
  _.forEach(messages, (v, i) => _.delay(sendMessage, i * msgDelay, v.replace(/#/g, '\\#')));
};
