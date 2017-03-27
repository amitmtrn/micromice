const MicroMice = require('../index');

class SimpleUnixSocketService extends MicroMice {
  constructor() {
    super({id: 'simpleUnixSocketService'});

    // emit test event to simpleUnixSocketService every second
    setTimeout(function emitTest(service) {
      service.emit('test', {someData:42, time: new Date()});

      setTimeout(emitTest, 1000, service);
    }, 1000, this.simpleUnixSocketService2);
  }

  services() {
    return ['simpleUnixSocketService2'];
  }

  start() {
    console.log('service is up');
  }
}

module.exports = new SimpleUnixSocketService();
