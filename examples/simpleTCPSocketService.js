const MicroMice = require('../index');

class SimpleTCPSocketService extends MicroMice {
  constructor() {
    super({id: 'simpleTCPSocketService'});

    // emit test event to simpleTCPSocketService every second
    setTimeout(function emitTest(service) {
      service.emit('test', {someData:42, time: new Date()});

      setTimeout(emitTest, 1000, service);
    }, 1000, this.simpleTCPSocketService2);
  }

  services() {
    return {
      simpleTCPSocketService2: {
        host: 'localhost'
      }
    };
  }

  start() {
    console.log('service is up');
  }
}

module.exports = new SimpleTCPSocketService();
