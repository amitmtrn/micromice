const _ = require('lodash');

/**
 * executor job is to execute the chian of actions related to the event
 * it has been placed in different file in order to allow later use as a middleware mechanisem
 */
module.exports = function(e) {

  if(!e.eventName)
    throw new Error(JSON.stringify(e) + 'is not event');

    _.each(this[e.eventName], (action) => {
      action(e);
    });
}
