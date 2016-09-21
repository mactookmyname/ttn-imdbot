/* eslint-disable no-param-reassign */
import sendMessages from '../utils/sendMessages';
import splitMessages from '../utils/splitMessages';

export default (bot, state, user) => {
  // Reset our last sent date so our auto trivia gets extended
  state.triviaLastSent = new Date();

  const i = state.triviaIndex;
  const title = state.imdb.Title;
  const trivia = state.trivia[i];

  const u = user ? `@${user.username} ` : '';
  const msg = `:tada: ${u}${title} Trivia ${i + 1} out of ${state.trivia.length}: ${trivia}`;
  sendMessages(bot, splitMessages(msg));
  state.triviaIndex = i === (state.trivia.length - 1) ? 0 : i + 1;
};
