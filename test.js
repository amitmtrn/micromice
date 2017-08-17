const micromice = require('./index');
const app = micromice();

app.on('test', (e) => {
  console.log(e);
  app.broadcast('hello', {world: 42});
})

app.on('connected', (e) => {
  console.log(e);
})

app.listen('./server.lock');