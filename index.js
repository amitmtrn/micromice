const ipc = require('node-ipc');
const _ = require('lodash');

function bindClient(key) {

  this[key] = this.ipc.of[key];

  /////////////////////////
  // extra client events //
  /////////////////////////

  this[key].once = (eventName, callback) => {
    let done = _.noop;
    const action = _.once(callback);
    const timeout = setTimeout(() => {
      this[key].off(eventName, done);

      action(null, new Error('[' + eventName + '][TIMEOUT]'));
    }, this.config.timeout);

    done = (data) => {
      this[key].off(eventName, done);
      clearTimeout(timeout);
      action(data);
    };

    this[key].on(eventName, done);
  };

  this[key].request = (eventName, eventData, callback) => {
    let done = _.noop;
    const action = _.once(callback);
    const requestID = _.uniqueId(eventName);
    const timeout = setTimeout(() => {
      this[key].off(eventName, done);

      action(null, new Error('[' + eventName + '][TIMEOUT]'));
    }, this.config.timeout);

    done = ({data, __requestID}) => {
      if(__requestID !== requestID)
        return;

      this[key].off(eventName, done);
      clearTimeout(timeout);
      action(data);
    };

    this[key].on(eventName, done);
    this[key].emit(eventName, {data: eventData, __requestID: requestID});
  };

  this[key].requestBy = (identifier, eventName, eventData, callback) => {
    let done = _.noop;
    const action = _.once(callback);
    const value = eventData[identifier];
    const timeout = setTimeout(() => {
      this[key].off(eventName, done);

      action(null, new Error('[' + eventName + '][TIMEOUT]'));
    }, this.config.timeout);

    done = (data) => {
      if(data[identifier] !== value)
        return;

      this[key].off(eventName, done);
      clearTimeout(timeout);
      action(data);
    };

    this[key].on(eventName, done);
    this[key].emit(eventName, eventData);
  };
}


class MicroMice {
  constructor(config) {
    this.config = _.defaults(config, { timeout: 2000 });
    this.ipc = new ipc.IPC();
    this.start = () => Promise.resolve();
    this.ipc.config = _.defaults(config, {
      id: _.uniqueId('service'),
      retry: 1500,
      silent: true
    }, this.ipc.config);

    const serve = config.host ? this.ipc.serveNet.bind(this.ipc) : this.ipc.serve.bind(this.ipc);

    serve(() => {
      this.emit = this.ipc.server.emit.bind(this.ipc.server);
      this.broadcast = this.ipc.server.broadcast.bind(this.ipc.server);

      this.start().then(() => {
        this._bindEvents();
      });
    });

    this._bindServices();
    this.ipc.server.start();
  }

  _bindEvents() {
    const events = this.events ? this.events() : null;

    if(!_.isPlainObject(events)) return;

    _.forEach(events, (value, key) => {
      this.ipc.server.on(key, (eventData, socket) => {
        const __requestID = eventData.__requestID;

        if(__requestID) { // is a request
          value.call(this, eventData.data, socket, (data) => {
            this.emit(socket, key, {data, __requestID});
          });
        } else {
          value.call(this, eventData, socket);
        }
      });
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
