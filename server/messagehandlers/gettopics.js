var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');

var configLocation = "./config.json";

// Returns an object containing a list of all topics (name + description)
exports.getTopics = function() {
  var topics = DataManager.getJSONObjectFromFilepath(configLocation).topics;
  for (var i in topics) {
    delete topics[i].viewInstances;
  }
  return {
      "topics": topics
  };
};
