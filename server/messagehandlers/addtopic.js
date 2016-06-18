var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');

var configLocation = "./config.json";

// Adds a topic to the config file - boolean return succes
exports.addTopic = function(name, description) {
  assert.notEqual(name, undefined, "topicname can't be undefined");
  assert.notEqual(name, "", "topicname can't be empty");

  assert.notEqual(description, undefined, "topicdescription can't be undefined");
  assert.notEqual(description, "", "topicdescription can't be empty");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);
  // Check if topic already exists
  for (var i in config.topics) {
    if (config.topics[i].name === name) {
        console.error((new Date()) + ' ' + "Topic '" + name + "' already exists in the config JSON file!");
        return false;
    }
  }
  // Create new topic
  var topic = {
      "name": name,
      "description": description,
      "viewInstances": []
  };
  // Add to config
  config.topics.push(topic);

  // Store in file
  DataManager.storeJSONObjectInFile(config, configLocation);
  return true;
};
