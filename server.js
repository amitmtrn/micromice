const net = require('net');
const fs = require('fs');
const CommandQueue = require('commandqueuejs');
const commandQueue = new CommandQueue({ executor: console.log, timing: 100});
const BSON = require('bson')
const bson = new BSON();

const server = net.createServer((c) => {

  // log incoming data
  c.on('data', (data) => {
    var doc_2 = bson.deserialize(data);
    
    commandQueue.push(data.byteLength);
    commandQueue.push(JSON.stringify(doc_2).length * 2);
    commandQueue.push(doc_2);
  });

});

// trow errors
server.on('error', (err) => {
  throw err;
});

fs.unlinkSync('./server.lock');
// open on port 8124
server.listen('./server.lock', () => {
  console.log('server bound');
});
