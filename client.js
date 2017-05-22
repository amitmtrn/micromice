const net = require('net');
const client = new net.Socket();
var BSON = require('bson')

const bson = new BSON();
 
// Serialize document
const doc = { long: 100, x: {
  some: "222"
} };
 
// Serialize a document
const data = bson.serialize(doc);

// open socket to server
client.connect('./service.lock', () => {
  // send message to server with love :)
  client.write(data);
  client.end();
});
