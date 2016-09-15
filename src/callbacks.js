module.exports = Callbacks;

function Callbacks() {
  this.index = -1;
  this.store = {};
};

Callbacks.prototype.create = function (fn) {
  var id = 'fn_' + (++this.index);
  var store = this.store;

  store[id] = function () {
    delete store[id];

    fn.apply(null, arguments);
  };

  return id;
};

Callbacks.prototype.run = function (id, args) {
  if (typeof this.store[id] === 'function') {
    this.store[id].apply(null, args);
    return true;
  } else {
    return false;
  }
};

Callbacks.prototype.empty = function () {
  this.store = {};
}
