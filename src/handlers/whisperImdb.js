import sendMessages from '../utils/sendMessages';
import splitMessages from '../utils/splitMessages';

const getHeader = (imdb) => {
  if (!imdb) {
    return 'IMDB information currently unavailable.';
  }

  const rating = imdb.rating ? `${imdb.rating}/10 - ` : '';
  const imdburl = `http://www.imdb.com/title/${imdb.imdbID}`;
  return `:movie_camera: Now Playing: ${imdb.Title} (${imdb.Year}) - ${rating}${imdburl}`;
};

const getMessages = ({ imdb, imdbImage }) => ([
  imdbImage.data.link,
  getHeader(imdb),
  ...splitMessages(imdb.Plot),
]);

export const postToChannel = (bot, state) => {
  sendMessages(bot, [
    ...getMessages(state),
    state.commands.length && `:point_right: Additional commands available in this channel: ${state.commands.join(' | ')}`,
  ]);
};

export default (bot, state, user) => {
  sendMessages(bot, getMessages(state), user.username);
};
