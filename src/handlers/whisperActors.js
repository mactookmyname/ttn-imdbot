import _ from 'lodash';

import sendMessages from '../utils/sendMessages';

export default (bot, state, user) => {
  const actors = _.get(state, 'imdb.Actors');
  const username = _.get(user, 'username');

  return (actors && actors !== 'N/A') ?
    sendMessages(bot, [`:couple: Featured Actor(s): ${actors}`], username) :
    sendMessages(bot, [':no_entry_sign: No Actor information found. :disappointed:'], username);
};
