const _ = require('lodash');

module.exports = function(newEventsList, currentEvent, index) {
  let eventList = newEventsList;
  
  _.each(this, (reducer) => {
    eventList = reducer(eventList, currentEvent, index);
  });
  
  return eventList;
}