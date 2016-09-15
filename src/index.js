var Callbacks = require('./callbacks');
var Primus = require('primus');
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var util = require('util');

module.exports = Bot;

function Bot(options) {
  this.options = Object.assign({
    url: 'https://www.treesnetwork.com',
    pathname: '/socket',
    maxRetries: 5,
    retryTimeout: 1000
  }, options);

  this.initialize();
};

util.inherits(Bot, EventEmitter);

Bot.prototype.initialize = function () {
  this.callQueue = [];
  this.callbacks = new Callbacks();
  this.resetState();

  this.loadSocketOptions(function (options) {
    this.createServer(options);
    this.listen();
    this.connect();
  }.bind(this));
};

Bot.prototype.resetState = function () {
  this.state = {
    authenticated: false,
    ready: false,
    connected: false,
    retryCount: 0
  };

  this.callbacks.empty();
}

Bot.prototype.loadSocketOptions = function (cb) {
  var url = this.options.url;

  if (url[url.length - 1] !== '/') {
    url += '/';
  }

  if (this.options.pathname[0] === '/') {
    url += this.options.pathname.slice(1);
  } else {
    url += this.options.pathname;
  }

  url += '/spec';

  request({url: url, json:true}, function (err, req, json) {
    if (!err) {
      cb(json);
    } else {
      this.log('Could not fetch socket information.');
    }
  }.bind(this));
};

Bot.prototype.createServer = function (options) {
  this.server = Primus.createSocket(options);
};

Bot.prototype.listen = function () {
  this.on('socket:ready', this.onReady.bind(this));
};

Bot.prototype.connect = function () {
  if (this.socket) {
    this.socket.end();
    this.socket = null;
  }

  this.log('Connecting...', this.options.url);

  this.socket = new this.server(this.options.url);
  this.socket.on('data', this.onData.bind(this));
  this.socket.on('end', this.onClose.bind(this));
};

Bot.prototype.log = function () {
  return console.log.apply(console, ['[Bot]'].concat(Array.prototype.slice.call(arguments, 0)));
};

Bot.prototype.call = function () {
  if (this.state.authenticated) {
    this._call.apply(this, arguments);
  } else {
    this.callQueue.push(arguments);
  }
};

Bot.prototype._call = function () {
  var data = {};
  var _arguments = [];

  for (var i = 0; i < arguments.length; i++) {
    if (i === 0) {
      data.method = arguments[i];
    } else if (i === (arguments.length - 1) && typeof arguments[i] === 'function') {
      data.callback = this.callbacks.create(arguments[i]);
    } else {
      _arguments.push(arguments[i]);
    }
  }

  if (_arguments.length) {
    data.arguments = _arguments;
  }

  return this.socket.write(data);
};

Bot.prototype.onData = function (data) {
  var parsed;

  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);

      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {}
  } else {
    parsed = data;
  }

  if (typeof parsed === 'object') {
    if (typeof parsed.type === 'string') {
      if (parsed.type === 'callback') {
        this.callbacks.run(parsed.callback, parsed.arguments);
      } else {
        if (this.state.connected || parsed.type === 'socket:ready') {
          this.emit(parsed.type, parsed.data);
        }
      }
    }
  }
};

Bot.prototype.onReady = function (data) {
  this.log('Server is ready...');
  this.state.ready = true;
  this.state.connected = true;

  if (typeof this.options.username === 'string' && typeof this.options.password === 'string') {
    this._authenticate();
  } else {
    this.log('Skipping authentication as no valid username/password options set.');
  }
};

Bot.prototype.onClose = function () {
  this.resetState();
};

Bot.prototype._authenticate = function () {
  this.log('Authenticating...');
  this._call('user.authenticate', {
    username: this.options.username,
    password: this.options.password
  }, function(err, data) {
    if (!err) {
      this.log('Authenticated!');
      this.state.user = data.user;
      this.state.authenticated = true;
      this.flushCallQueue();
    } else {
      console.log(JSON.stringify(err, null, 2));
      throw new Error('Could not authenticate the bot.');
    }
  }.bind(this));
};

Bot.prototype.flushCallQueue = function () {
  for (var i = 0; i < this.callQueue.length; i++) {
    this._call.apply(this, this.callQueue[i]);
  }

  this.callQueue = [];
};

Bot.prototype.disconnect = function () {
  if (this.state.connected) {
    this.close();
  }
};

Bot.prototype.close = function () {
  this.socket.end();
  this.resetState();
  this.server = null;
  this.socket = null;
};
