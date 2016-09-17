const Bot = require('../index');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const imgur = require('imgur');
const request = require('request');
const _ = require('lodash');
const getTrivia = require('./trivia');

/**
 * IMDBot
 * Automatically outputs IMDB information to config broadcast channel
 *
 * Available commands in chat:
 *   !imdb - whispers poster, title, year, rating, plot
 */
function IMDBot(options) {
  this.options = options;
  this.bot = new Bot({
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_PASSWORD,
  });
  this.onMessage = this.onMessage.bind(this);
  this.onSocket = this.onSocket.bind(this);
  this.getImdb = this.getImdb.bind(this);
  this.initialize();
}

util.inherits(IMDBot, EventEmitter);

IMDBot.prototype.initialize = function () {
  this.resetState();
  this.listenForEvents();
};

IMDBot.prototype.resetState = function () {
  this.state = {
    imdb: false,
    trivia: [],
    triviaIndex: 0,
  };
};

IMDBot.prototype.listenForEvents = function () {
  /**
   * The Bot object inherits from EventEmitter and emits any events it
   * receives from the socket server which let's us easily listen for events.
   */
  this.bot.on('messages:add', this.onMessage);
  this.bot.on('whispers:receive', this.onMessage);
  this.bot.on('socket:ready', this.onSocket);
  this.bot.on('video:play', this.getImdb);
};

IMDBot.prototype.onSocket = function (data) {
  if (!data.video) {
    this.bot.log('Unable to fetch video from Data:', data);
    return;
  }

  this.getImdb(data.video);
};

IMDBot.prototype.getImdb = function (data) {
  this.resetState();

  // The only reliable way to skip bumps
  if (_.includes(this.options.blacklist, data.name)) {
    return this.bot.log(`Skipping IMDB check for: ${data.name}`);
  }

  // It's unlikely we will find a record on IMDB for a video too short
  if (data.duration < this.options.minimumDuration) {
    return this.bot.log(`Skipping IMDB check due to not meeting minimum duration. Actual: ${data.duration}, Minimum: ${this.options.minimumDuration}`);
  }

  // Removes trailing year names on title which causes api lookup to fail
  const name = this.stripYear(data.name);

  // Searches specifically for series instead of movie for shorter durations
  const type = data.duration < this.options.seriesDuration ? 'series' : 'movie';

  const imdbOptions = {
    uri: 'http://www.omdbapi.com/?',
    json: true,
    qs: {
      type,
      t: name,
      plot: 'short',
      r: 'json',
    },
  };

  return request(imdbOptions, (err, response, imdbData) => {
    if (err) {
      return this.bot.log(`Error fetching IMDB data for ${name}.`, err);
    }

    this.state.imdb = imdbData;
    const imdburl = `http://www.imdb.com/title/${imdbData.imdbID}`;

    const rating = imdbData.rating ? `${imdbData.rating}/10 - ` : '';
    this.state.imdb.header = `:movie_camera: Now Playing: ${imdbData.Title} (${imdbData.Year}) - ${rating}${imdburl}`;

    getTrivia(`${imdburl}/trivia`, (triviaError, triviaData) => {
      if (triviaError) {
        return this.bot.log(`Unable to get trivia for ${name}`, triviaError);
      }

      this.state.trivia = _.shuffle(triviaData);
      return this.bot.log(`${triviaData.length} pieces of trivia fetched for ${name} (${imdbData.Year}).`);
    });

    return imgur.uploadUrl(imdbData.Poster).then((json) => {
      this.state.imdb.Poster = json.data.link;
      this.postToChannel(this.state.imdb);
    }).catch((imgurError) => {
      this.bot.error('Error uploading to imgur', imgurError.message);
    });
  });
};

IMDBot.prototype.onMessage = function (data) {
  if (typeof data.message === 'string') {
    const message = data.message.trim().toLowerCase();

    const triviaRegEx = new RegExp(`^(#${process.env.BROADCAST_CHANNEL} !trivia)|(!trivia #${process.env.BROADCAST_CHANNEL})`, 'i');

    if (message.match(/^!imdb/i)) {
      this.whisperImdb(data.user);
    } else if (message.match(triviaRegEx)) {
      this.bot.log(`Sending trivia to room at request of ${data.user.username}`);
      this.broadcastTrivia();
    }
  }
};

IMDBot.prototype.broadcastTrivia = function () {
  const i = this.state.triviaIndex;
  const title = this.state.imdb.Title;
  const trivia = this.state.trivia[i];

  this.sendMessages(this.splitMessage(`${title} Trivia ${i + 1} out of ${this.state.trivia.length}: ${trivia}`));
  this.state.triviaIndex = i === (this.state.trivia.length - 1) ? 0 : i + 1;
};

IMDBot.prototype.postToChannel = function (imdbData) {
  this.bot.log(`Posting IMDB information to #${process.env.BROADCAST_CHANNEL} for ${imdbData.Title}`);

  const commands = this.state.trivia ? `Additional commands available in this channel: !trivia (${this.state.trivia.length} available)` : '';

  const messages = [
    imdbData.Poster,
    imdbData.header,
    ...this.splitMessage(imdbData.Plot),
    commands,
  ];

  this.sendMessages(messages);
};

IMDBot.prototype.whisperImdb = function (user) {
  const messages = [
    this.state.imdb.Poster,
    this.state.imdb.header || 'IMDB information currently unavailable.',
    ...this.splitMessage(this.state.imdb.Plot),
  ];

  this.sendMessages(messages, user.username);
};

IMDBot.prototype.sendMessages = function (messages, target) {
  const msgDelay = 250;

  const sendMessage = (message) => {
    if (message) {
      if (target) {
        this.bot.call('chat.whisper', {
          target,
          message,
        });
      } else {
        this.bot.call('chat.post', {
          message: `#${process.env.BROADCAST_CHANNEL} ${message}`,
        });
      }
    }
  };

  _.forEach(messages, (v, i) => _.delay(sendMessage, i * msgDelay, v));
};

// Trees only supports messages less than 250 characters so we split long descriptions
IMDBot.prototype.splitMessage = function (message) {
  if (!message) {
    return [];
  }
  const re = /.{1,240}(?!\S)/g; // This regex grabs whole words up to 240 chars
  const messages = [];
  var result; // eslint-disable-line no-var, vars-on-top
  while ((result = re.exec(message)) !== null) { // eslint-disable-line
    messages.push(result[0]);
  }
  return messages;
};

IMDBot.prototype.stripYear = function (name) {
  return name.replace(/\s\(\d{4}\)/, '');
};

module.exports = IMDBot;
