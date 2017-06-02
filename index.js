const net = require('net');
const fs = require('fs');
const CommandQueue = require('commandqueuejs');
const BSON = require('bson');
const executor = require('./executor');
const agregator = require('./agregator');
const _ = require('lodash');

module.exports = function(config = {}) {
  const reducers = [];
  const middlewares = [];
  const events = {};
  const bson = new BSON();
  const commandQueue = new CommandQueue({ executor: executor.bind(events, middlewares), timing: config.timing || 200, agregator: agregator.bind(reducers) });
  const services = {};
  const sockets = [];

  const server = net.createServer((socket) => {
    sockets.push(socket);
    
    socket.on('data', (data) => {
      commandQueue.push(bson.deserialize(data));
    });
    
    socket.on('end', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });
    
  });

  server.on('error', (err) => {
    throw err;
  });

  _.each(config.services, (service) => {
    const serviceName = service.name;
    services[serviceName] = {};
    
    services[serviceName].socket = new net.Socket();
    services[serviceName].socket.connect(service.path);
    
    services[serviceName].emit = (eventName, data) => {
      const serialized = bson.serialize({eventName, data, serviceName: config.name || ''});

      services[serviceName].socket.write(serialized);
    }

    if(_.isArray(service.listenTo))
      services[serviceName].socket.on('data', (data) => {
        const e = bson.deserialize(data);
        e.services = services;

        if(service.listenTo.indexOf(e.eventName) > -1) {
          e.eventName = serviceName + ':' + e.eventName;
          commandQueue.push(e);
        }
      });
  });

  return {
    use(reducer) {
      reducers.push(reducer);
    },
    
    on(eventName, action) {
      if (!_.isArray(events[eventName]))
        events[eventName] = [];

      events[eventName].push(action);
    },
    
    off(eventName, action) {
      if (!_.isArray(events[eventName]))
        return false;

      if(action === '*') {
        delete events[eventName];

        return true;
      }

      const index = events[eventName].indexOf(action);

      if (index > -1) {
        array.splice(index, 1);
        return true;
      }

      return false;
    },
    
    once(eventName, action) {
      const oneFunction = _.once((e) => {
        action(e);

        this.off(oneFunction);
      });
      
      this.on(eventName, oneFunction);
    },
    
    broadcast(eventName, data) {
      data.eventName = eventName;

      const serialized = bson.serialize(data);
      
      _.each(sockets, (socket) => {
        socket.write(serialized);
      });

    },

    listen(path, callback) {
      if(!_.isFunction(callback))
        callback = _.noop;

      if (fs.existsSync(path))
        fs.unlinkSync(path);

      server.listen(path, (data) => {
        if(!_.isObject(data)) 
          data = {};

        callback(data);
        commandQueue.push({eventName: 'connected', data, services})
      });
    }
  };
}