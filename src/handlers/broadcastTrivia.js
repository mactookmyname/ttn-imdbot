/* eslint-disable no-param-reassign */
import _ from 'lodash';

import sendMessages from '../utils/sendMessages';

export default (bot, state, user) => {
  const trivia = _.get(state, 'trivia', []);
  const username = _.get(user, 'username');

  // Reset our last sent date so our auto trivia gets extended
  state.triviaLastSent = new Date();

  if (trivia.length === 0) {
    return sendMessages(bot, [':no_entry_sign: No Trivia available. :disappointed:'], username);
  }

  const i = _.get(state, 'triviaIndex');
  const title = _.get(state, 'imdb.Title');
  const triviaText = trivia[i];

  const u = username ? `@${username} ` : '';
  const msg = `:tada: ${u}${title} Trivia ${i + 1} out of ${trivia.length}: ${triviaText}`;
  state.triviaIndex = i === (trivia.length - 1) ? 0 : i + 1;
  return sendMessages(bot, msg);
};
