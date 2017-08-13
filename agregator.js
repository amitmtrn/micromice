const _ = require('lodash');

module.exports = function(newEventsList, currentEvent, index, eventList) {
  
  _.each(this, (reducer) => {
    eventList = reducer(eventList, currentEvent, index);
  });
  
  return eventList;
}