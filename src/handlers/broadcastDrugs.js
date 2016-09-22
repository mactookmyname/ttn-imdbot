import sendMessages from '../utils/sendMessages';
import splitMessages from '../utils/splitMessages';

export default (bot, state, user) => {
  if (!state.parentalGuide) {
    return sendMessages(bot, [':no_entry_sign: No Drug & Alcohol usage found. :disappointed:'], user.username);
  }

  const u = user ? `@${user.username} ` : '';
  const msg = `:weed: ${u}Drug & Alcohol Usage - Rating: ${state.parentalGuide.rating} - ${state.parentalGuide.summary}`;
  return sendMessages(bot, splitMessages(msg));
};
