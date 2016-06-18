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



// // Given a file name, return a json object
// function getJSONfromPath(filename) {
//     assert.notEqual(filename, "", "filename can't be empty");
//     assert.notEqual(filename, undefined, "filename can't be undefined");
//
//     try {
//         var file = pathing.resolve('./' + filename);
//         delete require.cache[file]; // Clear cache (otherwise files won't update)
//         var json = require(file);
//         return json;
//     } catch (err) {
//         console.error((new Date()) + ' ' + err);
//         /*
//         console.log("backup file to the rescue");
//         var backup = require("./"+backupPath);
//         turnJSONIntoFile(backup,"config.json");
//         return backup;*/
//     }
// }
//
// // Returns a list of the IP addresses of all DS screens
// function getScreenIPs() {
//
//     var json = getJSONfromPath(configPath);
//     var list = [];
//     for (var i = 0; i < json.screens.length; i++) {
//         list.push(json.screens[i].address);
//     }
//
//     return list;
// }
//
// // Gets the windowinfo message for a screen config entry
// function getWindowInfoForScreenConfig(screenObj, specifictopic) {
//     assert.notEqual(screenObj, undefined, "jsonSC can't be undefined!");
//     var topics = getJSONfromPath(configPath).topics;
//     var obj = {
//         "screenName": screenObj.name,
//         "screenWidth": screenObj.width,
//         "screenHeight": screenObj.height,
//         "views": getViewsForScreenConfig(screenObj, topics, specifictopic)
//     };
//     return obj;
// }
//
// // Gets the views list for a windowinfo message for a screen config entry
// function getViewsForScreenConfig(screenObj, topics, specifictopic) {
//     assert.notEqual(screenObj, undefined, "jsonSC can't be undefined!");
//     assert.notEqual(topics, undefined, "jsonSC can't be undefined!");
//     var results = [];
//     for (var i = 0; i < topics.length; i++) {
//         var topic = "";
//         if (specifictopic === undefined) {
//             topic = selectedTopic;
//         } else {
//             topic = specifictopic;
//         }
//         if (topics[i].name === topic) {
//             for (var j = 0; j < topics[i].viewInstances.length; j++) {
//                 var viewjson = getJSONfromPath("modules/" + topics[i].viewInstances[j].parentModuleFolderName + "/" + topics[i].viewInstances[j].viewFolderName + "/info.json");
//                 if (viewjson === undefined) continue; // If json file couldn't be read (wrong information in JSON file) then proceed to next
//                 var windowinfo = allWindows(topics[i].viewInstances[j], screenObj);
//                 if (windowinfo.length === 0) continue;
//                 var obj = {
//                     "viewFolderName": topics[i].viewInstances[j].viewFolderName,
//                     "instanceName": topics[i].viewInstances[j].instanceName,
//                     "instanceID": topics[i].viewInstances[j].id,
//                     "parentModuleFolderName": topics[i].viewInstances[j].parentModuleFolderName,
//                     "jsProgramUrl": viewjson.jsProgramUrl,
//                     "windows": windowinfo
//                 };
//                 results.push(obj);
//             }
//         }
//     }
//     return results;
// }
//
// // used by getViewsForScreenConfig to retrieve all windows
// function allWindows(jsonSC, jsonfile) {
//     assert.notEqual(jsonSC, undefined, "jsonSC can't be undefined!");
//     assert.notEqual(jsonfile, undefined, "jsonSC can't be undefined!");
//
//     var results = [];
//     for (var i = 0; i < jsonSC.windowBindings.length; i++) {
//         // TODO: Make windowFolderName only folder name and use seperate variables for module and view folders
//         var windowjson = getJSONfromPath("modules/" + jsonSC.windowBindings[i].windowFolderName + "/info.json");
//         if (windowjson === undefined) continue; // If json file couldn't be read (wrong information in JSON file) then proceed to next
//         var screenjson = undefined;
//         for (var j = 0; j < jsonfile.windows.length; j++) {
//             if (jsonfile.windows[j].id === jsonSC.windowBindings[i].locationID) {
//                 screenjson = jsonfile.windows[j];
//             }
//         }
//
//         if (screenjson === undefined) continue;
//         var obj = {
//             "bindingID": jsonSC.windowBindings[i].bindingID,
//             "name": windowjson.name,
//             "shape": screenjson.shape,
//             "width": screenjson.width,
//             "height": screenjson.height,
//             "locationID": jsonSC.windowBindings[i].locationID,
//             "x": screenjson.x,
//             "y": screenjson.y,
//             "htmlUrl": windowjson.htmlUrl
//         };
//         results.push(obj);
//     }
//     return results;
// }
//
// // TODO: Send update to Cpanel and Touch interface (Or everyone)
// // Adds a topic to the config
// function addTopic(topicname, topicdescription) {
//     assert.notEqual(topicname, undefined, "topicname can't be undefined");
//     assert.notEqual(topicname, "", "topicname can't be empty");
//
//     assert.notEqual(topicdescription, undefined, "topicdescription can't be undefined");
//     assert.notEqual(topicdescription, "", "topicdescription can't be empty");
//
//     var config = getJSONfromPath(configPath);
//     for (var i = 0; i < config.topics.length; i++) {
//         if (config.topics[i].name === topicname) {
//             console.error((new Date()) + ' ' + "Topic '" + topicname + "' already exists in the JSON file!");
//             return false;
//         }
//     }
//     var topic = {
//         "name": topicname,
//         "description": topicdescription,
//         "viewInstances": []
//     };
//     config.topics[config.topics.length] = topic;
//     turnJSONIntoFile(config, "config.json");
//     return true;
// }
//
// // TODO: Send update to Cpanel and Touch interface (Or everyone)
// // removes a topic from the configuration JSON file given a topicname
// function removeTopic(topicname) {
//     assert.notEqual(topicname, "", "topicname is empty");
//     assert.notEqual(topicname, undefined, "topicname is undefined");
//
//     var config = getJSONfromPath(configPath);
//     var newlist = [];
//     for (var i = 0; i < config.topics.length; i++) {
//         if (config.topics[i].name !== topicname) {
//             newlist.push(config.topics[i]);
//         }
//     }
//     config.topics = newlist;
//     turnJSONIntoFile(config, "config.json");
//     return true;
// }
//
// function removeModule(foldername, callback) {
//     assert.notEqual(foldername, "", "foldername can't be empty");
//     assert.notEqual(foldername, undefined, "foldername can't be undefined");
//
//     readDirectories("modules", function(directory) {
//         for (var i = 0; i < directory.length; i++) {
//             if (directory[i] === foldername) {
//                 var config = getJSONfromPath("config.json");
//                 var topics = config.topics;
//                 for (var j = 0; j < topics.length; j++) {
//                     var newlist = [];
//                     for (var k = 0; k < topics[j].viewInstances.length; k++) {
//                         if (topics[j].viewInstances[k].parentModuleFolderName !== foldername) {
//                             newlist.push(topics[j].viewInstances[k]);
//                         }
//                     }
//                     topics[j].viewInstances = newlist;
//                 }
//                 turnJSONIntoFile(config, "config.json");
//                 removeDir("./modules/" + foldername, function(success) {
//                     if (success) {
//                         return callback(true);
//                     } else {
//                         console.error("Could not remove directory?");
//                     }
//                 });
//             }
//         }
//         console.error((new Date()) + ' ' + foldername + " was not found!");
//         return callback(false);
//     });
// }
//
// // adds a "view" to the topic given a topicname and a JSON object that needs to be inserted (JSON file should contain a "view")
// // TODO: Test these assertions
// function addViewToTopic(topicname, viewjson) {
//     assert.notEqual(topicname, undefined, "Topicname is undefined");
//     assert.notEqual(topicname, "", "Topicname is empty");
//     assert.notEqual(viewjson, undefined, "view json file is undefined");
//     var viewObj = viewjson;
//     assert.notEqual(viewObj.screenName, undefined, "ScreenName is undefined");
//     assert.notEqual(viewObj.parentModuleFolderName, undefined, "parentModuleFolderName is undefined");
//     assert.notEqual(viewObj.config, undefined, "config is undefined");
//     assert.notEqual(viewObj.windowBindings, undefined, "windowBindings is undefined");
//
//     //TODO: Test this!
//     if (viewjson.hasOwnProperty('screenName') && viewjson.hasOwnProperty('parentModuleFolderName') && viewjson.hasOwnProperty('config') && viewjson.hasOwnProperty('windowBindings')) {
//         var config = getJSONfromPath(configPath);
//         for (var i = 0; i < config.topics.length; i++) {
//             if (config.topics[i].name === topicname) {
//                 config.topics[i].viewInstances[config.topics[i].viewInstances.length] = viewObj;
//                 turnJSONIntoFile(config, "config.json");
//                 return true;
//             }
//         }
//         console.error((new Date()) + ' ' + "Topic '" + topicname + "' does not exist in the JSON file!");
//         return false;
//     } else {
//         console.error((new Date()) + ' ' + "Invalid viewjson");
//         return false;
//     }
// }
//
// //TODO: Make the return type Boolean!
// // removes a view from the selected topic given a topicname and a viewFolderName
// function removeViewInTopic(topicname, viewFolderName) {
//
//     assert.notEqual(topicname, "", "Topicname can't be empty");
//     assert.notEqual(topicname, undefined, "Topicname can't be undefined");
//     assert.notEqual(viewFolderName, "", "viewFolderName can't be empty");
//     assert.notEqual(viewFolderName, undefined, "viewFolderName can't be undefined");
//
//     var config = getJSONfromPath(configPath);
//     var topics = config.topics;
//     for (var i = 0; i < topics.length; i++) {
//         if (topics[i].name === topicname) {
//             var newscreenviews = [];
//             for (var j = 0; j < topics[i].viewInstances.length; j++) {
//                 if (topics[i].viewInstances[j].viewFolderName !== viewFolderName) {
//                     newscreenviews.push(topics[i].viewInstances[j]);
//                 }
//             }
//             topics[i].viewInstances = newscreenviews;
//         }
//     }
//     turnJSONIntoFile(config, "config.json");
//     return;
// }
//
// function updateWindowInfo(topicname, ip, windowinfo) {
//     // Pre-information loading
//     var config = getJSONfromPath("config.json");
//     var topics = config.topics;
//     var screens = config.screens;
//
//     var correctTopic;
//     var correctScreen;
//
//     for (var i = 0; i < topics.length; i++) {
//         if (topics[i].name === topicname) {
//             correctTopic = topics[i];
//         }
//     }
//     if (correctTopic === undefined) {
//         console.error((new Date()) + ' ' + "Topic is undefined");
//         return false;
//     }
//
//     for (var j = 0; j < screens.length; j++) {
//         if (screens[j].address === ip) {
//             correctScreen = screens[i];
//         }
//     }
//     if (correctScreen === undefined) {
//         console.error((new Date()) + ' ' + "Screen is undefined");
//         return false;
//     }
//     // Pre-information loading finished
//
//     var configViews = correctTopic.viewInstances;
//     var infoViews = windowinfo.views;
//
//     // update Views in JSON
//
//     var found = false;
//     for (var m = 0; m < configViews.length; m++) {
//         for (var n = 0; n < infoViews.length; n++) {
//             if (configViews[m].id === infoViews[n].id) {
//                 found = true;
//                 configViews[m].instanceName = infoViews[n].instanceName;
//                 for (var k = 0; k < configViews[i].windowBindings.length; k++) {
//                     for (var l = 0; l < infoViews[n].windows.length; l++) {
//                         if (configViews[m].windowBindings[k].bindingID === infoViews[n].windows[k].bindingID) {
//                             configViews[m].windowBindings[k].locationID = infoViews[n].windows[k].locationID;
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     if (!found) {
//         console.error((new Date()) + ' ' + "View instance add function not implemented yet, returning FALSE!");
//         // Er is een view toegevoegd
//         return false;
//     }
//     turnJSONIntoFile(config, "config.json");
//     return true;
// }
//
// //TODO: rename this method (returnModuleList)
// // Returns list with all modules in the modules directory (callback needed for list)
//
// function sendModuleList(callback) {
//     readDirectories("modules", function(list) {
//         var listOfPromises = [];
//         for (var i = 0; i < list.length; i++) {
//             listOfPromises.push(new Promise(function(resolve, reject) {
//                 var info = getJSONfromPath("modules/" + list[i] + "/" + "info.json");
//                 var tmplist = list[i];
//                 getModuleInformation(list[i], function(moduleinfo) {
//                     var obj = {
//                         "folderName": tmplist,
//                         "name": info.name,
//                         "description": info.description,
//                         "developer": info.developer,
//                         "license": info.license,
//                         "views": moduleinfo
//                     };
//                     resolve(obj);
//                 });
//             }));
//         }
//         Promise.all(listOfPromises).then(function(results) {
//             var finalobj = {
//                 "modules": results
//             };
//             return callback(finalobj);
//         });
//     });
// }
//
// // Returns all topics in JSON format
// function getTopicList() {
//     var topics = getJSONfromPath(configPath).topics;
//     var list = [];
//     for (var i = 0; i < topics.length; i++) {
//         var listitem = {
//             "name": topics[i].name,
//             "description": topics[i].description
//         };
//         list.push(listitem);
//     }
//     var obj = {
//         "topics": list
//     };
//     return obj;
// }
//
// // given a JSON object and a filename, create a JSON file
// function turnJSONIntoFile(jsonObj, filename) {
//     fs.writeFileSync(filename, JSON.stringify(jsonObj), 'utf8');
//     /*
//     fs.writeFile(filename,JSON.stringify(jsonObj), function(err) {
//       if(filename === configPath){
//         console.log("Hello");
//           fs.writeFile(backupPath,JSON.stringify(jsonObj), function(err) {
//             if(err) return console.error(err);
//
//             console.log(backupPath+ " created!");
//           });
//       }
//       if(err) return console.error(err);
//       console.log(filename+" created!");
//     });*/
// }
//
// // returns list with all screens
// function getScreenList() {
//     var config = getJSONfromPath(configPath);
//     return config.screens;
// }
//
// function getModuleInformation(directory, callback) {
//     readDirectories("modules/" + directory, function(viewdirs) {
//         var listOfPromises = [];
//         for (var i = 0; i < viewdirs.length; i++) {
//             listOfPromises.push(new Promise(function(resolve, reject) {
//                 try {
//                     var viewinfo = require("./modules/" + directory + "/" + viewdirs[i] + "/info.json");
//                     getWindowInformation(directory + "/" + viewdirs[i], function(windows) {
//                         var obj = {
//                             "name": viewinfo.name,
//                             "description": viewinfo.description,
//                             "jsProgramUrl": viewinfo.jsProgramUrl,
//                             "windows": windows
//                         };
//                         resolve(obj);
//                     });
//                 } catch (e) {
//                     resolve(13);
//                 }
//             }));
//         }
//         Promise.all(listOfPromises).then(function(results) {
//             var list = [];
//             for (var i = 0; i < results.length; i++) {
//                 if (results[i] === 13) {
//                     continue;
//                 }
//                 list.push(results[i]);
//                 //console.log(results);
//             }
//             return callback(list);
//         });
//     });
// }
//
// function getWindowInformation(directory, callback) {
//     readDirectories("./modules/" + directory, function(windowdirs) {
//         var listOfPromises = [];
//         for (var j = 0; j < windowdirs.length; j++) {
//             listOfPromises.push(new Promise(function(resolve, reject) {
//                 try {
//                     var viewinfo = require("./modules/" + directory + "/" + windowdirs[j] + "/info.json");
//                     var obj = {
//                         "name": viewinfo.name,
//                         "description": viewinfo.description,
//                         "htmlUrl": viewinfo.htmlUrl
//                     };
//                     resolve(obj);
//                 } catch (e) {
//                     resolve(13);
//                 }
//             }));
//         }
//         Promise.all(listOfPromises).then(function(results) {
//             var list = [];
//             for (var i = 0; i < results.length; i++) {
//                 if (results[i] === 13) {
//                     continue;
//                 }
//                 list.push(results[i]);
//             }
//             return callback(list);
//         });
//     });
// }
