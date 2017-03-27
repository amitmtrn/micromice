const MicroMice = require('../index');

class SimpleUnixSocketService extends MicroMice {
  constructor() {
    super({id: 'simpleTCPSocketService2', host: 'localhost'});
  }

  events() {
    return {
      test: this.test
    }
  }

  start() {
    console.log('service is up');
  }

  test(data) {
    console.log('test event received');
    console.log(data);
  }
}

module.exports = new SimpleUnixSocketService();
