var Bot = require('../index');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var imdb = require('imdb-api');
var imgur = require('imgur');
const _ = require('lodash');

module.exports = IMDBot;

/**
 * IMDBot
 * Automatically outputs IMDB information to config broadcastChannel
 *
 * Available commands in chat:
 *   !imdb - whispers poster, title, year, rating, plot
 */
function IMDBot(options) {
  this.options = options;
  this.bot = new Bot({
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_PASSWORD
  });
  this.onMessage = this.onMessage.bind(this);
  this.onSocket = this.onSocket.bind(this);
  this.getImdb = this.getImdb.bind(this);
  this.initialize();
};

util.inherits(IMDBot, EventEmitter);

IMDBot.prototype.initialize = function () {
  this.resetState();
  this.listenForEvents();
};

IMDBot.prototype.resetState = function () {
  this.state = {
    imdb: false,
  };
}

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

IMDBot.prototype.getImdb = function(data) {
  this.resetState();

  // The only reliable way to skip bumps
  if (_.includes(this.options.blacklist, data.name)) {
    return this.bot.log(`Skipping IMDB check for: ${data.name}`);
  }

  // It's unlikely we will find a record on IMDB for a video too short
  if (data.duration < this.options.minimumDuration) {
    return this.bot.log(`Skipping IMDB check due to not meeting minimum duration. Actual: ${data.duration}, Minimum: ${this.options.minimumDuration}`);
  }

  imdb.getReq({ name: data.name }, (err, imdb) => {
    if (err) {
      return this.bot.log(`Error fetching IMDB data for ${data.name}.`, err);
    }

    this.state.imdb = imdb;
    this.state.imdb.header = `Now Playing: ${imdb.title} (${imdb._year_data}) - ${imdb.rating}/10 - ${imdb.imdburl}`;

    imgur.uploadUrl(imdb.poster).then(json => {
      this.state.imdb.poster = json.data.link;
      this.postToChannel(this.state.imdb);
    }).catch(err => {
      this.bot.error('Error uploading to imgur', err.message);
    });
  });
};

IMDBot.prototype.onMessage = function (data) {
  if (typeof data.message === 'string') {
    var message = data.message.trim().toLowerCase();

    if (message.match(/^!imdb/i)) {
      this.whisperImdb(data.user);
    }
  }
};

IMDBot.prototype.postToChannel = function(imdb) {
  this.bot.log(`Posting IMDB information to #imdb for ${imdb.title}`);

  const messages = [
    imdb.poster,
    imdb.header,
    ...this.splitMessage(imdb.plot),
  ];

  var i = 0;

  // slight delay iterating messages to ensure correct delivery order
  var sendMessage = () => {
    this.bot.call('chat.post', {
      message: `#${this.options.broadcastChannel} ${messages[i]}`,
    });

    i++;

    if (i < messages.length) {
      setTimeout(function() { sendMessage(); }, 100);
    }
  };

  sendMessage();
};

IMDBot.prototype.whisperImdb = function(user) {
  const target = user.username;
  const imdb = this.state.imdb;
  const msg = imdb
    ? imdb.header
    : 'IMDB information currently unavailable.';

  const messages = [
    imdb.poster,
    msg,
    ...this.splitMessage(imdb.plot),
  ];

  var i = 0;

  // slight delay iterating messages to ensure correct delivery order
  var sendMessage = function() {
    this.bot.call('chat.whisper', {
      target,
      message: messages[i],
    });

    i++;

    if (i < messages.length) {
      setTimeout(function() { sendMessage(); }, 100);
    }
  }.bind(this);

  sendMessage();
};

// Trees only supports messages less than 250 characters so we split long descriptions
IMDBot.prototype.splitMessage = function(message) {
  if (!message) {
    return [];
  }
  var re = /.{1,240}(?!\S)/g; // This regex grabs whole words up to 240 chars
  var messages = [];
  var result;
  while ((result = re.exec(message)) !== null) {
    messages.push(result[0]);
  }
  return messages;
};
