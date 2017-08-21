const micromice = require('../index');
const config = require('./config.json');
const app = micromice(config);

app.on('connected', (e) => {
  console.log('connected event sent');
  e.services.service1.emit('test', {some:'data'});
});

app.on('service1:hello', (e) => {
  console.log(e);
});

app.listen('./service2.lock', () => {
  console.log('connected');
});