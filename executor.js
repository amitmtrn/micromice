const _ = require('lodash');

module.exports = function(middlewares, e) {
  if(!e.eventName) 
    throw new Error(JSON.stringify(e) + 'is not event');

    _.each(this[e.eventName], (action) => {
      action(e);
    });
}
