import _ from 'lodash';

import splitMessages from './splitMessages';
import { MSG_DELAY, TTN_MAX_MSG_SIZE } from '../config';

// Prepends the env channel name, if doing a post
const prependChannel = target => message => (target ? message : `#${process.env.BROADCAST_CHANNEL} ${message}`);

// This converts '#' in message into backslash escaped to get around ttn server filtering
const escapeHash = message => _.replace(message, /#/g, '\\#');

// Determines whether to whisper or post based on presence of target user
const botCommand = target => (target ? 'chat.whisper' : 'chat.post');

// If our incoming message is long, let's split it
const splitLongMessage = message => (_.lte(message.length, TTN_MAX_MSG_SIZE) ?
  message :
  splitMessages(message)
);

// Since we are going to chain everything through lodash, convert str to array
const prepareMessages = messages => (_.isString(messages) ? [messages] : messages);

const sendMessages = (bot, messages, target) => {
  const sendMessage = (msg, idx) => {
    if (_.isArray(msg)) { return sendMessages(bot, msg, target); }

    const message = prependChannel(target)(escapeHash(msg));

    return new Promise(resolve => {
      const blob = _.pickBy({
        message,
        target,
      });
      _.delay(() => {
        _.attempt(() =>
          // bot.call(botCommand(target), blob)
          console.log(blob)
        );
        resolve(blob);
      }, idx * MSG_DELAY);
    });
  };

  return _.chain(prepareMessages(messages))
          .compact()
          .map(splitLongMessage)
          .map(sendMessage)
          .flatten()
          .value();
};

export default sendMessages;
