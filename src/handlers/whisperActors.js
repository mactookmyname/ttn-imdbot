import sendMessages from '../utils/sendMessages';

export default (bot, { imdb }, { username }) => (
  imdb.Actors !== 'N/A' ?
    sendMessages(bot, [`:couple: Featured Actor(s): ${imdb.Actors}`], username) :
    sendMessages(bot, [':no_entry_sign: No Actor information found. :disappointed:'], username)
);
