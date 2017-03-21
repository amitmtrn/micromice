const ipc = require('node-ipc');
const _ = require('lodash');

class MicroMice {
  constructor(config) {
    this.ipc = new ipc.IPC();

    this.ipc.config = _.defaults(config, {
      id: _.uniqueId('service'),
      retry: 1500
    }, this.ipc.config);

    this.ipc.serve(() => {
      this.emit = this.ipc.server.emit.bind(this.ipc.server);
      this.broadcast = this.ipc.server.broadcast.bind(this.ipc.server);

      this._bindEvents();
      this.start ? this.start() : _.noop;
    });

    this._bindPairs();
    this.ipc.server.start();
  }

  _bindEvents() {
    const events = this.events ? this.events() : null;

    if(!_.isPlainObject(events)) return;

    _.forEach(events, (value, key) => {
      this.ipc.server.on(key, value.bind(this));
    });
  }

  _bindPairs() {
    const pairs = this.pairs ? this.pairs() : null;

    if(!_.isPlainObject(pairs)) return;

    _.forEach(pairs, (value, key) => {
      this.ipc.connectTo(key, () => {this[key] = this.ipc.of[key]});
    });

  }

}

module.exports = MicroMice;
