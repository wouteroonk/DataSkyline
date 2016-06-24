var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');
var fs = require('fs'); // For file system access

var configLocation = "./config.json";

// Updates a screen using a screen object
exports.updateScreen = function(screenObj) {
  assert.notEqual(screenObj, undefined, "You must specify a screen object in updateScreen call (screen is undefined)");
  assert.notEqual(screenObj, null, "You must specify a screen object in updateScreen call (screen is null)");
  assert(screenObj.hasOwnProperty('id'), "Screen does not have a screenID in updateScreen call");
  assert(screenObj.hasOwnProperty('windows'), "Screen does not have viewInstances array in updateScreen call");

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

        var shouldDelete = false;
        // Loop through windows for view instance
        for (var l in viewInstance.windowBindings) {
          // Check if this window is in screens windows
          var foundWindow = false;
          for (var m in screenObj.windows) {
            if (screenObj.windows[m].id === viewInstance.windowBindings[l].locationID) {
              foundWindow = true;
            }
          }
          // If window was not found, we should delete the view instance
          if (!foundWindow) {
            shouldDelete = true;
            break;
          }
        }
        // Delete the view instance if it is neccessary
        if (shouldDelete) {
          config.topics[j].viewInstances.splice(k, 1);
        }
      }
    }

    // Now we can start the screen replace
    config.screens.splice(i, 1);
    config.screens.push(screenObj);

    // Store the new config file
    DataManager.storeJSONObjectInFile(config, configLocation);
    return true;
  }
  // If we got here, we didn't find the specified screen.
  console.error((new Date()) + ' Tried to change screen for non-existing id \"' + screenObj.id + '\"!');
  return false;

};
