import createBot, {
  MESSAGES_ADD,
  SOCKET_READY,
  VIDEO_PLAY,
  WHISPERS_RECEIVE,
  withAuth,
} from '@ttn/bot';
import imgur from 'imgur';
import _ from 'lodash';

import handlers from './handlers/handlers';
import broadcastTrivia from './handlers/broadcastTrivia';
import {
  BLACKLIST,
  MINIMUM_DURATION,
  TRIVIA_AUTO_DURATION,
  TRIVIA_AUTO_INTERVAL,
  TRIVIA_AUTO_REQUIRED_MINIMUM,
} from './config';
import getOmdb from './data/omdb';
import { getTrivia, getParentalGuide } from './data/imdb';
import { postToChannel } from './handlers/sendImdb';

/**
 * IMDBot
 * Automatically outputs IMDB information to config broadcast channel
 */
export default function getImdbot() {
  const initialState = {
    imdb: false,
    imdbImage: '',
    commands: [],
    parentalGuide: {},
    trivia: [],
    triviaIndex: 0,
    triviaLastSent: new Date(),
    triviaTimer: null,
  };

  let state = { ...initialState };

  const resetState = () => {
    if (_.has(state, 'triviaTimer')) {
      clearInterval(state.triviaTimer);
    }

    state = {
      ...initialState,
      triviaLastSent: new Date(),
    };
  };

  const setState = (newState) => {
    state = {
      ...state,
      ...newState,
    };
  };

  const bot = withAuth(createBot)();

  const startTriviaTimeout = () => (
    setInterval(() => {
      if (new Date() - state.triviaLastSent > TRIVIA_AUTO_DURATION) {
        bot.debug(`Auto sending trivia due to inactivity, last trivia sent @ ${state.triviaLastSent.toISOString()}`);
        broadcastTrivia(bot, state);
      }
    }, TRIVIA_AUTO_INTERVAL)
  );

  const getImdb = async (video) => {
    resetState();

    // The only reliable way to skip bumps
    if (_.includes(BLACKLIST, video.name)) {
      return bot.debug(`Skipping IMDB check for: ${video.name}`);
    }

    // It's unlikely we will find a record on IMDB for a video too short
    if (video.duration < MINIMUM_DURATION) {
      return bot.debug(`Skipping IMDB check due to not meeting minimum duration. Actual: ${video.duration}, Minimum: ${MINIMUM_DURATION}`);
    }

    try {
      const imdb = await getOmdb(video);
      const trivia = _.shuffle(await getTrivia(imdb.imdbID));
      const triviaTimer = (trivia.length >= TRIVIA_AUTO_REQUIRED_MINIMUM) && startTriviaTimeout();
      const parentalGuide = await getParentalGuide(imdb.imdbID);

      // need this extra catch to prevent falling into async try/catch block on imgur error
      const imdbImage = await imgur.uploadUrl(imdb.Poster).catch(() => '');

      setState({
        imdb,
        imdbImage,
        trivia,
        triviaTimer,
        parentalGuide,
        commands: [
          trivia.length && `!trivia (${trivia.length} available)`,
          parentalGuide && '!drugs',
          imdb.Actors !== 'N/A' && '!actors',
          imdb.Director !== 'N/A' && '!director',
          imdb.Writer !== 'N/A' && '!writer',
          ...state.commands,
        ],
      });

      bot.debug(`IMDB data fetched for ${video.name}: ${trivia.length} pieces of trivia fetched.`);
      return postToChannel(bot, state);
    } catch (e) {
      return bot.debug(`Error fetching IMDB data for ${video.name}.`, e);
    }
  };

  const onMessage = ({ message, user }) => {
    handlers.forEach((h) => {
      const regex = new RegExp(`^(?:@${process.env.BOT_USERNAME} )?(?:#${process.env.BROADCAST_CHANNEL} )?${h.match}$`, 'i');
      return message.match(regex) && h.handler.call(null, bot, state, user);
    });
  };

  const onSocket = (data) => getImdb(_.get(data, 'video'));

  const start = ({ username, password }) => {
    bot.debug('Starting up imdbot...');

    bot.start()
      .then(() => bot.authenticate(username, password))
      .catch((err) => {
        bot.debug('Unable to start up imdbot.', err);
        bot.stop();
      });
  };

  bot.subscribe(MESSAGES_ADD, onMessage);
  bot.subscribe(WHISPERS_RECEIVE, onMessage);
  bot.subscribe(SOCKET_READY, onSocket);
  bot.subscribe(VIDEO_PLAY, getImdb);

  return {
    start,
  };
}
