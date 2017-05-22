const micromice = require('./index');
const config = require('./config.json');
const app = micromice(config);

app.on('connected', (e) => {
  e.services.server.emit('test', {some:'data'});
});

app.on('server:hello', (e) => {
  console.log(e);
});

app.listen('./test2.lock', () => {
  console.log('connected');
});