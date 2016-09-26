import _ from 'lodash';

import sendMessages from '../utils/sendMessages';

const additionalCommands = commands => commands.length &&
  `:point_right: Additional commands available in this channel: ${_.compact(commands).join(' | ')}`;

export const getHeader = (imdb) => {
  if (!imdb) {
    return 'IMDB information currently unavailable.';
  }

  const rating = imdb.rating ? `${imdb.rating}/10` : '';
  const year = _.has(imdb, 'Year') ? `(${imdb.Year})` : '';
  const imdburl = _.has(imdb, 'imdbID') ? `http://www.imdb.com/title/${imdb.imdbID}` : '';
  return _.compact([
    `:movie_camera: Now Playing: ${imdb.Title}`,
    year,
    rating,
    imdburl,
  ]).join(' - ');
};

const getMessages = state => ([
  _.get(state, 'imdbImage.data.link'),
  getHeader(_.get(state, 'imdb')),
  _.get(state, 'imdb.Plot'),
]);

export const postToChannel = (bot, state) => {
  const commands = _.get(state, 'commands', []);

  return sendMessages(bot, [
    ...getMessages(state),
    additionalCommands(commands),
  ]);
};

export default (bot, state, user) => {
  const username = _.get(user, 'username');

  return sendMessages(bot, getMessages(state), username);
};
