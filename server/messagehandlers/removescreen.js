var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');
var fs = require('fs'); // For file system access

var configLocation = "./config.json";

// Removes a screen using a screen id
exports.removeScreen = function(id) {
  assert.notEqual(id, undefined, "You must specify an id in removeScreen call (id is undefined)");
  assert.notEqual(id, null, "You must specify an id in removeScreen call (id is null)");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);

  // Loop through screens and change screen with id in screen object
  for (var i = config.screens.length - 1; i >= 0; i--) {
    if (config.screens[i].id !== screenObj.id) {
      continue;
    }

    // Check if all view instances (in all topics) still have their windows
    // If not, remove them
    for (var j in config.topics) {
      // Remove view instances with deleted screens
      for (var k = config.topics[j].viewInstances.length -1; k >= 0; k--) {
        var viewInstance = config.topics[j].viewInstances[k];
        // We should only modify view instances for this screen
        if (viewInstance.screenID !== screenObj.id) continue;

        // Delete the view instance if we got here
        config.topics[j].viewInstances.splice(k, 1);
      }
    }

    // Now we can remove the screen
    config.screens.splice(i, 1);

    // Store the new config file
    DataManager.storeJSONObjectInFile(config, configLocation);
    return true;
  }
  // If we got here, we didn't find the specified screen id.
  console.error((new Date()) + ' Tried to remove screen with non-existing id \"' + screenObj.id + '\"!');
  return false;

};
