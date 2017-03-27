const MicroMice = require('../index');

class SimpleUnixSocketService extends MicroMice {
  constructor() {
    super({id: 'simpleTCPSocketService'});

    // emit test event to simpleUnixSocketService every second
    setTimeout(function emitTest(service) {
      service.emit('test', {someData:42, time: new Date()});

      setTimeout(emitTest, 1000, service);
    }, 1000, this.simpleUnixSocketService2);
  }

  services() {
    return {
      simpleUnixSocketService2: {
        host: 'localhost'
      }
    };
  }

  start() {
    console.log('service is up');
  }
}

module.exports = new SimpleUnixSocketService();
