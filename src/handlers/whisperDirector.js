import _ from 'lodash';

import sendMessages from '../utils/sendMessages';

export default (bot, state, user) => {
  const Director = _.get(state, 'imdb.Director');
  const username = _.get(user, 'username');

  return (Director && Director !== 'N/A') ?
    sendMessages(bot, [`:sunglasses: Director(s): ${Director}`], username) :
    sendMessages(bot, [':no_entry_sign: No Director information found. :disappointed:'], username);
};
