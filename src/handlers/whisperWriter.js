import _ from 'lodash';

import sendMessages from '../utils/sendMessages';

export default (bot, state, user) => {
  const Writer = _.get(state, 'imdb.Writer');
  const username = _.get(user, 'username');

  return (Writer && Writer !== 'N/A') ?
    sendMessages(bot, [`:speech_balloon: Writer(s): ${Writer}`], username) :
    sendMessages(bot, [':no_entry_sign: No Writer information found. :disappointed:'], username);
};
