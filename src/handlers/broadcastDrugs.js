import sendMessages from '../utils/sendMessages';
import splitMessages from '../utils/splitMessages';

export default (bot, state, user) => {
  const u = user ? `@${user.username} ` : '';
  const msg = `:weed: ${u}Drug & Alcohol Usage - Rating: ${state.parentalGuide.rating} - ${state.parentalGuide.summary}`;
  sendMessages(bot, splitMessages(msg));
};