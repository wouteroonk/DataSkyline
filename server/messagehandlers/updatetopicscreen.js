var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');
var fs = require('fs'); // For file system access

var configLocation = "./config.json";

// Updates a screen in a specified topic using a windowinfo object
exports.updateTopicScreen = function(windowinfo) {
  assert.notEqual(windowinfo, undefined, "You must specify a windowinfo object in updateTopicScreen call (windowinfo is undefined)");
  assert.notEqual(windowinfo, null, "You must specify a windowinfo object in updateTopicScreen call (windowinfo is null)");
  assert(windowinfo.hasOwnProperty('screenID'), "Windowinfo does not have a screenID in updateTopicScreen call");
  assert(windowinfo.hasOwnProperty('viewInstances'), "Windowinfo does not have viewInstances array in updateTopicScreen call");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);

  // Loop through topics and change topic with name in windowinfo
  for (var i in config.topics) {
    if (config.topics[i].name !== windowinfo.topicName) {
      continue;
    }

    // Clear out previous setup for this screen
    var indexesToRemove = [];
    for (var j in config.topics[i].viewInstances) {
      if (config.topics[i].viewInstances[j].screenID === windowinfo.screenID) {
        indexesToRemove.push(j);
      }
    }
    // Lol
    for (var indexIndex = indexesToRemove.length-1; indexIndex >= 0; indexIndex--) {
      config.topics[i].viewInstances.splice(indexesToRemove[indexIndex], 1);
    }

    // Create new view instances in config based on windowinfo
    for (var k in windowinfo.viewInstances) {
      var wininfViewInstance = windowinfo.viewInstances[k];
      var viewInstance = {};

      // Transfer variables from windowinfo viewInstance to config.json viewInstance format
      viewInstance.viewFolderName = wininfViewInstance.viewFolderName;
      viewInstance.instanceName = wininfViewInstance.instanceName;
      viewInstance.id = wininfViewInstance.instanceID;
      viewInstance.parentModuleFolderName = wininfViewInstance.parentModuleFolderName;
      viewInstance.config = wininfViewInstance.config;
      viewInstance.screenID = windowinfo.screenID;

      // Tranfer windows
      viewInstance.windowBindings = [];
      for (var l in wininfViewInstance.windows) {
        var windowObj = wininfViewInstance.windows[l];
        var windowBinding = {};

        windowBinding.bindingID = windowObj.bindingID;
        windowBinding.windowFolderName = windowObj.folderName;
        windowBinding.locationID = windowObj.locationID;

        // Add window binding to view instance
        viewInstance.windowBindings.push(windowBinding);
      }
      // Add view instance to config
      config.topics[i].viewInstances.push(viewInstance);
    }

    // Store the new config file
    DataManager.storeJSONObjectInFile(config, configLocation);
    return true;
  }
  // If we got here, we didn't find the specified topic.
  console.error((new Date()) + ' Tried to change screen for non-existing topic \"' + windowinfo.topicName + '\"!');
  return false;

};
