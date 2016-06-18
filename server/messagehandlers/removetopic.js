var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');

var configLocation = "./config.json";

// Removes a topic from the config file - boolean return succes
exports.removeTopic = function(name) {
  assert.notEqual(name, undefined, "topicname can't be undefined");
  assert.notEqual(name, "", "topicname can't be empty");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);
  // Check if topic exists and remove it
  for (var i in config.topics) {
    if (config.topics[i].name === name) {
        config.topics.splice(i, 1);
        DataManager.storeJSONObjectInFile(config, configLocation);
        console.log((new Date()) + ' ' + "Topic '" + name + "' was deleted.");
        return true;
    }
  }
  console.warn((new Date()) + ' ' + "Topic '" + name + "' was not found and thus not deleted.");
  return false;
};
