import _ from 'lodash';

import sendMessages from '../utils/sendMessages';

export default (bot, state, user) => {
  const parentalGuide = _.get(state, 'parentalGuide');
  const username = _.get(user, 'username');
  if (!parentalGuide) {
    return sendMessages(bot, [':no_entry_sign: No Drug & Alcohol usage found. :disappointed:'], username);
  }

  const u = username ? `@${username} ` : '';
  const rating = parentalGuide.rating ? `Rating: ${parentalGuide.rating} - ` : '';
  const msg = `:weed: ${u}Drug & Alcohol Usage - ${rating}${parentalGuide.summary}`;
  return sendMessages(bot, msg);
};
