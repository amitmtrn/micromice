# MicroMice
A lightweight framework for micro services in node js.

## Code Example

```js
const MicroMice = require('micromice');

class SomeService extends MicroMice {
  constructor() {
    super({id: 'world'});
  }

  services() {
    return {
      someOtherService: true
    }
  }

  events() {
    return {
      test: this.test
    }
  }

  start() {
    console.log('service is up');
  }

  test() {
    this.someOtherService.emit('othertest', {someData:42});
    
    console.log('test event received');
  }
}

module.exports = new SomeService();
```

## Motivation


## Installation

```bash
npm init
npm install micromice --save
```

## API Reference

### constructor
in the constractor after extending micromice you should use super with configuration of the [node-ipc config](https://www.npmjs.com/package/node-ipc#ipc-config) currently only support unix/windows sockets

### events method
this method contains a map of the events that will be listened by micromice. all the methods are bind to the microservice.
the events follow the rules of [node-ipc events](https://www.npmjs.com/package/node-ipc#ipc-config)


### services method
this method map all the methods that this service connect to. the true in the value will be replaced later on with connection details once TCP/TLS will be supported.
the service in the method will be bind to the microservice object.

### start method
this method will be executed once the service is up.

## Tests
not yet implemented

## Contributors

tasks
* tests

## License

MIT license
