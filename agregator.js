const _ = require('lodash');

/**
 * the agregator take all the reducers and reduce the event queue accordingliy
 */
module.exports = function(newEventsList, currentEvent, index, eventList) {
  
  _.each(this, (reducer) => {
    eventList = reducer(eventList, currentEvent, index);
  });
  
  return eventList;
}