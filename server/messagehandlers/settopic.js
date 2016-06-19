var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');

var configLocation = "./config.json";

// Changes the current topic - boolean return succes
exports.setTopic = function(name) {
  assert.notEqual(name, undefined, "topicname can't be undefined");
  assert.notEqual(name, "", "topicname can't be empty");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);
  // Check if topic exists. If so, set it
  for (var i in config.topics) {
    if (config.topics[i].name === name) {
        config.currentTopic = name;
        // Store in file
        DataManager.storeJSONObjectInFile(config, configLocation);
        console.info((new Date()) + ' ' + "Changed current topic to \"" + name + "\".");
        return true;
    }
  }

  // If we got here, topic was not found
  return false;
};
