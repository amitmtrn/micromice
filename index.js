const ipc = require('node-ipc');
const _ = require('lodash');

function bindClient(key) {

  this[key] = this.ipc.of[key];

  /////////////////////////
  // extra client events //
  /////////////////////////

  this[key].once = (eventName, callback) => {
    this.ipc.of[key].on(eventName, function done(data) {
      this.ipc.of[key].off(eventName, done);
      callback(data);
    }.bind(this));
  };

  this[key].request = (eventName, eventData, callback) => {
    let done = _.noop;
    let action = _.once(callback);
    const timeout = setTimeout(() => {
      this[key].off(eventName, done);

      callback(null, new Error('[' + eventName + '][TIMEOUT]'));
    }, this.config.timeout);

    done = (data) => {
      clearTimeout(timeout);
      action(data);
    };

    this[key].once(eventName, done);
    this[key].emit(eventName, eventData);
  };
}


class MicroMice {
  constructor(config) {
    this.config = _.defaults(config, { timeout: 2000 });
    this.ipc = new ipc.IPC();
    this.ipc.config = _.defaults(config, {
      id: _.uniqueId('service'),
      retry: 1500,
      silent: true
    }, this.ipc.config);

    const serve = config.host ? this.ipc.serveNet.bind(this.ipc) : this.ipc.serve.bind(this.ipc);

    serve(() => {
      this.emit = this.ipc.server.emit.bind(this.ipc.server);
      this.broadcast = this.ipc.server.broadcast.bind(this.ipc.server);

      this._bindEvents();
      this.start ? this.start() : _.noop;
    });

    this._bindServices();
    this.ipc.server.start();
  }

  _bindEvents() {
    const events = this.events ? this.events() : null;

    if(!_.isPlainObject(events)) return;

    _.forEach(events, (value, key) => {
      this.ipc.server.on(key, value.bind(this));
    });
  }

  _bindServices() {
    const services = this.services ? this.services() : null;

    if(!_.isPlainObject(services) && !_.isArray(services)) return;

    _.forEach(services, (value, key) => {

      if(_.isPlainObject(value))
        return this.ipc.connectToNet(key, value.host, value.port, bindClient.bind(this, key));

      if(_.isArray(services))
        return this.ipc.connectTo(value, bindClient.bind(this, value));

      return this.ipc.connectTo(key, bindClient.bind(this, key));
    });

  }

}

module.exports = MicroMice;
