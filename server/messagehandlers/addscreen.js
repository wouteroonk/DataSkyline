var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');

var configLocation = "./config.json";

// Adds a screen to the config file - boolean return succes
exports.addScreen = function(screenObj) {
  assert.notEqual(screenObj, undefined, "screen object can't be undefined");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);
  // Check if topic already exists
  var maxId = 0;
  for (var i in config.screens) {
    if (config.screens[i].id > maxId) maxId = config.screens[i].id;

    if (
      config.screens[i].name === screenObj.name ||
      config.screens[i].address === screenObj.address
    ) {
        console.error((new Date()) + ' ' + "Screen '" + screenObj.name + "' already exists in the config JSON file!");
        return false;
    }
  }
  screenObj.id = maxId + 1;

  // Add to config
  config.screens.push(screenObj);

  // Store in file
  DataManager.storeJSONObjectInFile(config, configLocation);
  return true;
};
