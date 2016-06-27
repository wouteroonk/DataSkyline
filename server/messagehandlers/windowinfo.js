var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');

var configLocation = "./config.json";

// Returns a windowinfo object for the specified screen and topicName
exports.getWindowInfo = function (ip, topicName) {
  assert.notEqual(ip, undefined, "You must specify an IP in getWindowInfo call (ip is undefined)");
  assert.notEqual(ip, null, "You must specify an IP in getWindowInfo call (IP is null)");

  assert.notEqual(topicName, undefined, "You must specify a topic in getWindowInfo call (topic is undefined)");
  assert.notEqual(topicName, null, "You must specify a topic in getWindowInfo call (topic is null)");

  var config = DataManager.getJSONObjectFromFilepath(configLocation);

  var wininf = {};

  // Get the screen object
  var screen = DataManager.getScreen(ip, config);
  if (screen === undefined) {
    console.error((new Date()) + ' ' + " Screen \"" + ip + "\" does not exist.");
    return;
  }
  // Place data from screen in windowinfo object
  wininf.screenID = screen.id;
  wininf.screenName = screen.name;
  wininf.screenDescription = screen.description;
  wininf.screenWidth = screen.width;
  wininf.screenHeight = screen.height;

  // Get the topic object
  var topic = DataManager.getTopic(topicName, config);
  if (topic === undefined) {
    console.error((new Date()) + ' ' + " Topic \"" + ip + "\" does not exist.");
    return;
  }
  // Place data from topic in windowinfo object
  wininf.topicName = topic.name;
  wininf.topicDescription = topic.description;
  wininf.viewInstances = [];

  for (var i in topic.viewInstances) {
    var viewInstance = topic.viewInstances[i];
    if (viewInstance.screenID !== screen.id) continue;

    var wininfViewInstance = {};
    // Place data from topic viewInstance in wininfViewInstance
    wininfViewInstance.viewFolderName = viewInstance.viewFolderName;
    wininfViewInstance.instanceName = viewInstance.instanceName;
    wininfViewInstance.parentModuleFolderName = viewInstance.parentModuleFolderName;
    wininfViewInstance.config = viewInstance.config;

    // Place data from view's info.json in wininfViewInstance
    var viewInfoJSON = DataManager.getJSONObjectFromFilepath('./modules/' + viewInstance.parentModuleFolderName + '/' + viewInstance.viewFolderName + "/info.json");
    if (viewInfoJSON === undefined) {
      console.error((new Date()) + ' ' + " View " + viewInstance.viewFolderName + " has problems with its info.json file.");
      continue;
    }
    wininfViewInstance.viewName = viewInfoJSON.name;
    wininfViewInstance.jsProgramUrl = viewInfoJSON.jsProgramUrl;

    // Add windows to wininfViewInstance
    wininfViewInstance.windows = [];
    for (var j in viewInstance.windowBindings) {
      var windowBinding = viewInstance.windowBindings[j];

      var windowLocation = DataManager.getWindowLocation(windowBinding.locationID, screen);
      if (windowLocation === undefined) {
        console.error((new Date()) + ' ' + " There is no windowLocation with ID " + windowBinding.locationID);
        continue;
      }

      var windowInfoJSON = DataManager.getJSONObjectFromFilepath('./modules/' + viewInstance.parentModuleFolderName + '/' + viewInstance.viewFolderName + '/' + windowBinding.windowFolderName + '/info.json');
      if (windowInfoJSON === undefined) {
        console.error((new Date()) + ' ' + " Window " + windowBinding.windowFolderName + " has problems with its info.json file.");
        continue;
      }

      var window = {};
      window.bindingID = windowBinding.bindingID;
      window.name = windowInfoJSON.name;
      window.folderName = windowBinding.windowFolderName;
      window.shape = windowLocation.shape;
      window.width = windowLocation.width;
      window.height = windowLocation.height;
      window.locationID = windowBinding.locationID;
      window.x = windowLocation.x;
      window.y = windowLocation.y;
      window.htmlUrl = windowInfoJSON.htmlUrl;
      window.screenshotUrl = windowInfoJSON.screenshotUrl;

      wininfViewInstance.windows.push(window);
    }
    wininf.viewInstances.push(wininfViewInstance);
  }

  return wininf;
};
