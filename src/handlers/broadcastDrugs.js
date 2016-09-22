import sendMessages from '../utils/sendMessages';
import splitMessages from '../utils/splitMessages';

export default (bot, { parentalGuide }, { username }) => {
  if (!parentalGuide) {
    return sendMessages(bot, [':no_entry_sign: No Drug & Alcohol usage found. :disappointed:'], username);
  }

  const u = username ? `@${username} ` : '';
  const msg = `:weed: ${u}Drug & Alcohol Usage - Rating: ${parentalGuide.rating} - ${parentalGuide.summary}`;
  return sendMessages(bot, splitMessages(msg));
};
