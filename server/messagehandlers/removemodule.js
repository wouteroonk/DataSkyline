var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');
var fs = require('fs'); // For file system access
var rmdir = require("rmdir"); // For removing directories recursively

var configLocation = "./config.json";

// Removes a module from filesystem and removes implemented views from this module - boolean return succes
exports.removeModule = function(folderName) {
  assert.notEqual(folderName, undefined, "folderName can't be undefined");
  assert.notEqual(folderName, "", "folderName can't be empty");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);
  // Remove traces of module in topics
  for (var i in config.topics) {
    for (var j in config.topics[i].viewInstances) {
      if (config.topics[i].viewInstances[j].parentModuleFolderName === folderName) {
        config.topics[i].viewInstances.splice(j, 1);
      }
    }
  }
  console.info((new Date()) + ' All references to module \"' + folderName + '\" in topics were deleted.');

  // Store in file
  DataManager.storeJSONObjectInFile(config, configLocation);

  if (fs.readdirSync('./modules/').indexOf(folderName) === -1) {
    console.warn((new Date()) + ' Module \"' + folderName + '\" does not exist and cannot be deleted from filesystem.');
    return false;
  }

  rmdir('./modules/' + folderName);
  console.info((new Date()) + ' Module \"' + folderName + '\" was deleted from filesystem.');

  return true;
};
