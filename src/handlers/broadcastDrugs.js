import sendMessages from '../utils/sendMessages';
import splitMessages from '../utils/splitMessages';

export default (bot, { parentalGuide }, { username }) => {
  if (!parentalGuide) {
    return sendMessages(bot, [':no_entry_sign: No Drug & Alcohol usage found. :disappointed:'], username);
  }

  const u = username ? `@${username} ` : '';
  const rating = parentalGuide.rating ? `Rating: ${parentalGuide.rating} - ` : '';
  const msg = `:weed: ${u}Drug & Alcohol Usage - ${rating}${parentalGuide.summary}`;
  return sendMessages(bot, splitMessages(msg));
};
