import sendMessages from '../utils/sendMessages';

export default (bot, { imdb }, { username }) => (
  imdb.Writer !== 'N/A' ?
    sendMessages(bot, [`:speech_balloon: Writer(s): ${imdb.Writer}`], username) :
    sendMessages(bot, [':no_entry_sign: No Writer information found. :disappointed:'], username)
);
