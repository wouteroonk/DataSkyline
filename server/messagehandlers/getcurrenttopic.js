var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');

var configLocation = "./config.json";

// Returns an object containing a list of all topics (name + description)
exports.getCurrentTopic = function() {
  var config = DataManager.getJSONObjectFromFilepath(configLocation);

  var currentTopicName = DataManager.getCurrentTopicName(config);

  for (var i in config.topics) {
    if (config.topics[i].name === currentTopicName) return config.topics[i];
  }

  // If we got here, topic is invalid
  console.error((new Date()) + ' The currentTopic stores a non-existant topic name!');
  return undefined;
};
