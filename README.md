# MicroMice
A lightweight framework for micro services in node js.

## Code Example

```js
const MicroMice = require('micromice');

class SomeService extends MicroMice {
  constructor() {
    super({id: 'world'});
  }

  events() {
    return {
      test: this.test
    }
  }

  test() {
    console.log('test');
  }
}

module.exports = new SomeService();
```

## Motivation


## Installation

```bash
npm install micromice --save
```

## API Reference

constructor()

events()

services()

## Tests

not yet implemented

## Contributors

tasks
* tests
* add tcp/udp/tls support
* create once for services events

## License

MIT license
