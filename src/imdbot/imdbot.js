const Bot = require('../index');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const imdb = require('imdb-api');
const imgur = require('imgur');
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
    this.bootstrap.log('Unable to fetch video from Data:', data);
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

  return imdb.getReq({ name }, (err, imdbData) => {
    if (err) {
      return this.bot.log(`Error fetching IMDB data for ${name}.`, err);
    }

    this.state.imdb = imdbData;

    // eslint-disable-next-line
    this.state.imdb.header = `Now Playing: ${imdbData.title} (${imdbData._year_data}) - ${imdbData.rating}/10 - ${imdbData.imdburl}`;

    getTrivia(`${imdbData.imdburl}/trivia`, (triviaError, triviaData) => {
      if (triviaError) {
        return this.bot.log(`Unable to get trivia for ${name}`, triviaError);
      }

      this.state.trivia = _.shuffle(triviaData);
      return this.bot.log(`${triviaData.length} pieces of trivia fetched for ${name}.`);
    });

    return imgur.uploadUrl(imdbData.poster).then((json) => {
      this.state.imdb.poster = json.data.link;
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
  const title = this.state.imdb.title;
  const trivia = this.state.trivia[i];

  this.sendMessages(this.splitMessage(`${title} Trivia ${i + 1} out of ${this.state.trivia.length}: ${trivia}`));
  this.state.triviaIndex = i === (this.state.trivia.length - 1) ? 0 : i + 1;
};

IMDBot.prototype.postToChannel = function (imdbData) {
  this.bot.log(`Posting IMDB information to #${process.env.BROADCAST_CHANNEL} for ${imdbData.title}`);

  const messages = [
    imdbData.poster,
    imdbData.header,
    ...this.splitMessage(imdbData.plot),
    'Additional commands available in this channel: !trivia',
  ];

  this.sendMessages(messages);
};

IMDBot.prototype.whisperImdb = function (user) {
  const messages = [
    this.state.imdb.poster,
    this.state.imdb.header || 'IMDB information currently unavailable.',
    ...this.splitMessage(this.state.imdb.plot),
  ];

  this.sendMessages(messages, user.username);
};

IMDBot.prototype.sendMessages = function (messages, target) {
  const msgDelay = 50;

  const sendMessage = (message) => {
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
