/**
  All changes and lookups in the config.json file are done from here
*/

var assert = require('assert'); // For asserts
var fs = require("fs"); //Access local filesystem

// ========================
// JSON file lookups
// ========================

// Get the screen object associated with the IP
exports.getScreen = function (ip, config) {
  assert.notEqual(ip, undefined, "You must specify an ip in getScreen call (ip is undefined)");
  assert.notEqual(ip, null, "You must specify an ip in getScreen call (ip is null)");
  assert.notEqual(ip, "", "You must specify an ip in getScreen call (ip is empty)");

  assert.notEqual(config, undefined, "You must specify a config in getScreen call (config is undefined)");
  assert.notEqual(config, null, "You must specify a config in getScreen call (config is null)");
  assert(config.hasOwnProperty('screens'), "The given config object does not have a screens list");

  return config.screens.filter(function(screen) {
    return screen.address === ip;
  })[0];
};

// Get the topic object for the topic with the given name
exports.getTopic = function (name, config) {
  assert.notEqual(name, undefined, "You must specify a name in getTopic call (name is undefined)");
  assert.notEqual(name, null, "You must specify a name in getTopic call (name is null)");
  assert.notEqual(name, "", "You must specify a name in getTopic call (name is empty)");

  assert.notEqual(config, undefined, "You must specify a config in getTopic call (config is undefined)");
  assert.notEqual(config, null, "You must specify a config in getTopic call (config is null)");
  assert(config.hasOwnProperty('topics'), "The given config object does not have a topics list");

  return config.topics.filter(function(topic) {
    return topic.name === name;
  })[0];
};

exports.getCurrentTopicName = function (config) {
  assert.notEqual(config, undefined, "You must specify a config in getCurrentTopicName call (config is undefined)");
  assert.notEqual(config, null, "You must specify a config in getCurrentTopicName call (config is null)");
  assert(config.hasOwnProperty('currentTopic'), "The given config object does not have a currentTopic variable");

  var currentTopicName = config.currentTopic;
};

// Get the window location object for the window location with the given ID on the given screen
exports.getWindowLocation = function (id, screen) {
  assert.notEqual(id, undefined, "You must specify an id in getWindowLocation call (id is undefined)");
  assert.notEqual(id, null, "You must specify an id in getWindowLocation call (id is null)");
  assert.notEqual(id, "", "You must specify an id in getWindowLocation call (id is empty)");

  assert.notEqual(screen, undefined, "You must specify a screen in getWindowLocation call (screen is undefined)");
  assert.notEqual(screen, null, "You must specify a screen in getWindowLocation call (screen is null)");
  assert(screen.hasOwnProperty('windows'), "The given screen object does not have a windows list");

  return screen.windows.filter(function(windowLocation) {
    return windowLocation.id === id;
  })[0];
};

// Helper function. Read a JSON file and return as object
exports.getJSONObjectFromFilepath = function (path) {
  assert.notEqual(path, undefined, "You must specify a path in getJSONObjectFromFilepath call (path is undefined)");
  assert.notEqual(path, null, "You must specify a path in getJSONObjectFromFilepath call (path is null)");
  assert.notEqual(path, "", "You must specify a path in getJSONObjectFromFilepath call (path is empty)");

  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    console.error((new Date()) + ' ' + 'error reading/parsing JSON from file ' + path + ': ' + err);
  }
};

// ========================
// JSON file edits
// ========================

// Helper function. Store an object in a .json file
exports.storeJSONObjectInFile = function (object, filepath) {
  assert.notEqual(object, undefined, "You must specify an object in storeJSONObjectInFile call (object is undefined)");
  assert.notEqual(object, null, "You must specify an object in storeJSONObjectInFile call (object is null)");

  assert.notEqual(filepath, undefined, "You must specify a filepath in storeJSONObjectInFile call (filepath is undefined)");
  assert.notEqual(filepath, null, "You must specify a filepath in storeJSONObjectInFile call (filepath is null)");
  assert.notEqual(filepath, "", "You must specify a filepath in storeJSONObjectInFile call (filepath is empty)");

  fs.writeFileSync(filepath, JSON.stringify(object), 'utf8');
};

// ========================
// File system
// ========================

exports.getAllModulesFull = function () {
  var modules = [];

  // Loop through contents of modules directory. Should only be modules.
  var moduleFolderNames = fs.readdirSync('./modules/');
  for (var i in moduleFolderNames) {
    var moduleFolderName = moduleFolderNames[i];
    var moduleObj = {};
    moduleObj.views = [];

    // Filter out files that may be placed in module directory
    if (!fs.statSync('./modules/' + moduleFolderName).isDirectory()) {
      console.warn((new Date()) + ' File with name \"' + moduleFolderName + '\" does not belong in modules folder. Please remove it.');
      continue;
    }

    // Loop through contents of module directory. Should mostly be views + info.json
    // Module object is filled in here
    var viewFolderNames = fs.readdirSync('./modules/' + moduleFolderName);
    for (var j in viewFolderNames) {
      var viewFolderName = viewFolderNames[j];
      var viewObj = {};
      viewObj.windows = [];

      if (!fs.statSync('./modules/' + moduleFolderName + '/' + viewFolderName).isDirectory()) {
        // Might be info.json for module, or something else

        // Filter non-info.json files
        if (viewFolderName !== 'info.json') {
          console.warn((new Date()) + ' File with name \"' + viewFolderName + '\" does not belong in folder \"./modules/' + moduleFolderName + '\". Please remove it.');
          continue;
        }

        var moduleInfoJSON = exports.getJSONObjectFromFilepath('./modules/' + moduleFolderName + '/' + viewFolderName);
        moduleObj.name = moduleInfoJSON.name;
        moduleObj.folderName = moduleFolderName;
        moduleObj.description = moduleInfoJSON.description;
        moduleObj.license = moduleInfoJSON.license;
        moduleObj.developer = moduleInfoJSON.developer;

        continue;
      }

      // Loop through contents of view directory. Should mostly be windows + info.json and JS
      // View object is filled in here
      var windowFolderNames = fs.readdirSync('./modules/' + moduleFolderName + '/' + viewFolderName);
      for (var k in windowFolderNames) {
        var windowFolderName = windowFolderNames[k];
        var windowObj = {};

        if (!fs.statSync('./modules/' + moduleFolderName + '/' + viewFolderName + '/' + windowFolderName).isDirectory()) {
          // Might be info.json for view, or javascript file, or something else

          // Filter non-info.json files
          if (windowFolderName !== 'info.json') {
            // Shouldn't log because it may be a JS file or something like that
            continue;
          }

          // Fill view object
          var viewInfoJSON = exports.getJSONObjectFromFilepath('./modules/' + moduleFolderName + '/' + viewFolderName + '/' + windowFolderName);
          viewObj.name = viewInfoJSON.name;
          viewObj.folderName = viewFolderName;
          viewObj.description = viewInfoJSON.description;
          viewObj.jsProgramUrl = viewInfoJSON.jsProgramUrl;
          viewObj.configTemplate = viewInfoJSON.configTemplate;

          continue;
        }

        // Get window info.json object or go back to top if not info.json
        var windowInfoJSON = exports.getJSONObjectFromFilepath('./modules/' + moduleFolderName + '/' + viewFolderName + '/' + windowFolderName + '/info.json');
        if (windowInfoJSON === undefined) {
          continue;
        }

        // Fill window object
        windowObj.name = windowInfoJSON.name;
        windowObj.folderName = windowFolderName;
        windowObj.description = windowInfoJSON.description;
        windowObj.htmlUrl = windowInfoJSON.htmlUrl;
        windowObj.preferredShape = windowInfoJSON.preferredShape;
        windowObj.preferredWidth = windowInfoJSON.preferredWidth;
        windowObj.preferredHeight = windowInfoJSON.preferredHeight;
        windowObj.screenshotUrl = windowInfoJSON.screenshotUrl;

        // Add window to view
        viewObj.windows.push(windowObj);

      }
      // END OF LOOP: windowFolderNames

      // Now check if we found the neccessary components to build a view:
      if (
        viewObj.name !== undefined &&
        viewObj.name.length >= 1 &&
        viewObj.folderName !== undefined &&
        viewObj.folderName.length >= 1 &&
        viewObj.description !== undefined &&
        viewObj.description.length >= 1 &&
        viewObj.jsProgramUrl !== undefined &&
        viewObj.jsProgramUrl.length >= 1 &&
        viewObj.configTemplate !== undefined &&
        viewObj.configTemplate.hasOwnProperty('configItems')
      ) {
        // We can add view to module
        moduleObj.views.push(viewObj);
      }
    }
    // END OF LOOP: viewFolderNames

    // Now check if we found the neccessary components to build a module:
    if (
      moduleObj.name !== undefined &&
      moduleObj.name.length >= 1 &&
      moduleObj.folderName !== undefined &&
      moduleObj.folderName.length >= 1 &&
      moduleObj.description !== undefined &&
      moduleObj.description.length >= 1 &&
      moduleObj.license !== undefined &&
      moduleObj.license.length >= 1 &&
      moduleObj.developer !== undefined &&
      moduleObj.developer.length >= 1
    ) {
      // We can add module to list
      modules.push(moduleObj);
    }
  }
  // END OF LOOP: moduleFolderNames

  return modules;
};
