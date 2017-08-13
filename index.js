const net = require('net');
const fs = require('fs');
const CommandQueue = require('commandqueuejs');
const BSON = require('bson');
const executor = require('./executor');
const agregator = require('./agregator');
const _ = require('lodash');
const bson = new BSON();

module.exports = function(config = {}) {
  const reducers = []; // application reducers
  const events = {}; // event to be executed when activated by command queue
  // the on which hold all the recived commands
  const commandQueue = new CommandQueue({ executor: executor.bind(events), timing: config.timing || 200, agregator: agregator.bind(reducers) });
  const services = {}; // connected services
  let serviceSocket = null;

  // the micro service server
  const server = net.createServer((socket) => {
    serviceSocket = socket;

    socket.on('data', (data) => { // add events to command queue
      commandQueue.push(bson.deserialize(data));
    });

    socket.on('end', function () { // remove socket when socket close
      serviceSocket = null;
      console.log('socket disconnected');
    });

  });

  // throw service errors
  server.on('error', (err) => {
    throw err;
  });

   // registering services
  _.each(config.services, (service) => {
    const serviceName = service.name;
    services[serviceName] = {};
    
    // create new socket of the connected service
    services[serviceName].socket = new net.Socket();
    console.log('connected to ', service.path);
    services[serviceName].socket.connect(service.path); // connect to the service via socket
    
    // emit method for services (emit to service)
    services[serviceName].emit = (eventName, data) => {
      // data sent through bson
      const serialized = bson.serialize({eventName, data, serviceName: config.name || ''});
      // write to service socket the new data
      services[serviceName].socket.write(serialized);
    }

    // reactive event listening
    if(_.isArray(service.listenTo))
      // listen to events on service socket
      services[serviceName].socket.on('data', (data) => {
        const e = bson.deserialize(data); // data is bson so need to parse
        e.services = services;

        if(service.listenTo.indexOf(e.eventName) > -1) { // if event is beening listend
          e.eventName = serviceName + ':' + e.eventName; // show it in the api as serviceName:eventName
          commandQueue.push(e); // and push the event to the command queue
        }
      });
  });

  return {
    /**
     * add reducer to the app
     */
    use(reducer) {
      reducers.push(reducer);
    },
    
    /**
     * when recive event
     */
    on(eventName, action) {
      if (!_.isArray(events[eventName]))
        events[eventName] = [];

      events[eventName].push(action);
    },

    /**
     * remove event listener
     */
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
    
    /**
     * execute event once
     */
    once(eventName, action) {
      const oneFunction = _.once((e) => {
        action(e);

        this.off(oneFunction);
      });
      
      this.on(eventName, oneFunction);
    },
    
    /**
     * send event to all those how listen
     */
    broadcast(eventName, data) {
      data.eventName = eventName; // need the event name as part of the data
      
      const serialized = bson.serialize(data);
      serviceSocket.write(serialized);
    },

    /**
     * open port / unix socket
     */
    listen(path, callback) {
      if(!_.isFunction(callback))
        callback = _.noop;

      // remove socket file if exists
      if (fs.existsSync(path))
        fs.unlinkSync(path);

      server.listen(path, (data) => {
        if(!_.isObject(data)) 
          data = {};

        callback(data);
        // send connected event
        commandQueue.push({eventName: 'connected', data, services});
      });
    }
  };
}