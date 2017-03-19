# MicroMice

## how it's work?

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

new SomeService();
```