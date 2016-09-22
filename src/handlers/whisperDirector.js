import sendMessages from '../utils/sendMessages';

export default (bot, { imdb }, { username }) => (
  imdb.Director !== 'N/A' ?
    sendMessages(bot, [`:sunglasses: Director(s): ${imdb.Director}`], username) :
    sendMessages(bot, [':no_entry_sign: No Director information found. :disappointed:'], username)
);
