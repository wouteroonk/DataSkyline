#!/usr/bin/env node
 // Global variables

// Require other nodes
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require("fs"); //Access local filesystem
var request = require("request"); //To make an http GET request to external json file
var pathing = require("path");
var multer = require("multer");
var mime = require("mime"); // for adding an extension to a file.
var AdmZip = require("adm-zip");
var rmdir = require("rmdir");
var mkdirp = require("mkdirp");
var assert = require('assert'); // For assertions
var Promise = require('promise');
var archiver = require('archiver');

// Message handlers
var WindowInfoHandler = require('./messagehandlers/windowinfo.js');
var GetTopicsHandler = require('./messagehandlers/gettopics.js');
var AddTopicHandler = require('./messagehandlers/addtopic.js');
var RemoveTopicHandler = require('./messagehandlers/removetopic.js');
var RemoveModuleHandler = require('./messagehandlers/removemodule.js');
var GetModulesHandler = require('./messagehandlers/getmodules.js');
var SetTopicHandler = require('./messagehandlers/settopic.js');
var GetCurrentTopicHandler = require('./messagehandlers/getcurrenttopic.js');
var GetScreensHandler = require('./messagehandlers/getscreens.js');
var UpdateTopicScreenHandler = require('./messagehandlers/updatetopicscreen.js');
var AddScreenHandler = require('./messagehandlers/addscreen.js');
var UpdateScreenHandler = require('./messagehandlers/updatescreen.js');
var RemoveScreenHandler = require('./messagehandlers/removescreen.js');

// Data manager
var DataManager = require('./datamanager.js');


// The selected dataskyline topic
var configPath = "config.json";

// list of currently connected clients (users)
var clients = [];
var connectionList = [];

//Count of currently connected clients
var connectionCount = 0;

//Max amount of connected clients allowed
var maxConnections = 7;

//Construct HTTP server
// The HTTP server allows clients to talk to the DataSkyline server using the HTTP protocol.
// In this instance, the HTTP server is used to serve the control panel and is used in the websocket server.
var server = http.createServer(function(request, response) {

  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Request-Method', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  response.setHeader('Access-Control-Allow-Headers', '*');

  // We need to filter the url because browsers might send parameters, which we don't support.
  var filteredUrl = request.url.split('?')[0];
  //Handles all the post messages sent to the server.
  if (request.method == 'POST') {
    //for now there is no check for which path, it is assumed that all post requests are module uploads.
    // TODO: Fix this
    if (filteredUrl === '/uploadmodule') {
      handleModuleUpload(request, response);
    } else {
      console.warn((new Date()) + ' Received unhandled POST request from ' + request.connection.remoteAddress);
    }

  } else if (filteredUrl === '/downloadmodule') {
    handleModuleDownload(request, response, request.url.split('?')[1]);
  }
  // Serve control panel when root is accessed
  else if (filteredUrl === '/') {
    fs.readFile('cpanel/cpanel.html', 'utf8', function(err, data) {
      if (err) {
        response.writeHead(404);
        response.end();
      } else {
        response.writeHead(200, {
          'Content-Type': 'text/html'
        });
        response.end(data);
      }
    });
  }
  // In all other cases, assume file is being accessed.
  else {
    fs.readFile('./' + filteredUrl, function(err, data) {
      if (!err) {
        // Get file extension
        var dotoffset = filteredUrl.lastIndexOf('.');
        // If file does not have an extension, handle as plain text
        // In all other cases, assume file has one of the following predefined extensions
        // TODO: Fix this! If file with undefined extension is accessed, bad things happen.
        var mimetype = dotoffset == -1 ? 'text/plain' : {
          '.html': 'text/html',
          '.ico': 'image/x-icon',
          '.jpg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.css': 'text/css',
          '.js': 'text/javascript',
          '.zip': 'application/zip'
        }[filteredUrl.substr(dotoffset)];
        // Set the content type and write the file
        response.setHeader('Content-type', mimetype);
        response.end(data);
      } else {
        // File does not exist
        console.warn((new Date()) + ' Unable to handle request for file \"' + filteredUrl + "\": file not found.");
        response.writeHead(404, "Not Found");
        response.end();
      }
    });
  }
});

// Make the HTTP server listen on port 8080
server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

// Create a websocket server.
// This is used for:
// * telling DataSkyline screens which modules they should show
// * receiving commands from control panel
// * sending commands to control panel for feedback
wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

// Function to check if connection will be accepted/rejected
// TODO: Find out why origin variable is passed
function originIsAllowed(origin) {
  var allowed = true;
  var checked = false;

  //Loop through clients list and insert connection at next free index
  //Reject connection if max connections is reached
  while (clients[connectionCount]) {
    if (connectionCount >= maxConnections - 1) {
      if (checked) {
        allowed = false;
        checked = false;
        break;
      }
      connectionCount = -1;
      checked = true;
    }
    connectionCount++;
  }

  return allowed;
}

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
  // Make sure we only accept requests from an allowed origin
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.warn((new Date()) + ' Request from ' + request.remoteAddress + " was rejected.");
    return;
  }

  var co = {};

  // TODO: What is "echo-protocol"?
  var connection = request.accept('echo-protocol', request.origin);
  var index = connectionCount; //Assign index to new connection
  clients[index] = connection; //Add to client list

  console.log((new Date()) + ' Connection accepted from ' + connection.remoteAddress);

  // When a message is received
  connection.on('message', function(message) {
    var topicname = "";
    var data = message.utf8Data.split(' ');

    // Get the message type and perform matching action
    switch (data.shift()) {
      // Identify yourself
      case "identification":
        var address = data.shift();
        if (!alreadyIdentified(address)) {
          co = new ConnectionObject(connection, address); //TODO: Test this!
          identifyConnection(co);
        } else {
          console.log((new Date()) + ' Client tried to identify with already registered ip \"' + address + "\".");
        }
        break;

        // Clients asks for windowinfo for IP and possibly specific topic
      case "requestwindows":
        var ipAddress = data.shift();
        var specifictopic = data.shift(); // [Optional]

        if (specifictopic === undefined) specifictopic = GetCurrentTopicHandler.getCurrentTopic().name;
        if (specifictopic === undefined) {
          console.warn((new Date()) + ' No topic was specified and there is not currentTopic available.');
          console.warn((new Date()) + ' Failed sending windowinfo for ' + ipAddress + ' to client.');
          return;
        }

        var windowInfoObject = WindowInfoHandler.getWindowInfo(ipAddress, specifictopic);
        if (windowInfoObject === undefined) {
          console.warn((new Date()) + ' Failed sending windowinfo for ' + ipAddress + ' to client.');
          return;
        }
        console.log((new Date()) + ' Succeeded sending windowinfo for ' + ipAddress + ' to client.');
        connection.send("windowinfo " + JSON.stringify(windowInfoObject));
        break;

        // "gettopics" is requested by the control panel, it will return the topiclist from the JSON configuration file
      case "gettopics":
        var topicsObject = GetTopicsHandler.getTopics();
        if (topicsObject === undefined) {
          console.warn((new Date()) + ' Failed sending gettopics to client.');
          return;
        }
        console.log((new Date()) + ' Succeeded sending gettopics to client.');
        connection.send("gettopics " + JSON.stringify(topicsObject));
        break;

        // "addview" is requested by the control panel, it will give a JSON object (containing a view) that needs to be added to the configuration JSON file.
        // WARNING: Deprecated: Views are now added via windowinfo message send by client (updatetopic)
        // case "addview":
        //     topicname = data.shift();
        //     var returnedJSON = JSON.parse(data.join(" "));
        //     if (addViewToTopic(topicname, returnedJSON)) {
        //         connection.send("addview " + "200");
        //         sendSkylineUpdate("addview");
        //     } else {
        //         connection.send("addview " + "400");
        //     }
        //     break;

        // "addtopic" is requested by the control panel, it will need a topicname and description, with this information, a new topic will be added to the configuration file
      case "addtopic":
        topicname = data.shift();
        var topicdescription = data.join(" ");

        if (!AddTopicHandler.addTopic(topicname, topicdescription)) {
          console.warn((new Date()) + ' Failed adding topic ' + topicname + '.');
          connection.send("addtopic 400");
          return;
        }
        console.log((new Date()) + ' Succeeded adding topic ' + topicname + '.');
        connection.send("addtopic 200");
        sendSkylineUpdate("addtopic");
        break;

        // "removetopic" is requested by the control panel, it will remove a topic from the configuration JSON file given a topicname
      case "removetopic":
        topicname = data.shift();

        if (!RemoveTopicHandler.removeTopic(topicname)) {
          console.warn((new Date()) + ' Failed removing topic ' + topicname + '.');
          connection.send("removetopic 400");
          return;
        }
        console.log((new Date()) + ' Succeeded removing topic ' + topicname + '.');
        connection.send("removetopic 200");
        sendSkylineUpdate("removetopic");
        break;

        // WARNING: Deprecated: Views are now removed via windowinfo message send by client (updatetopic)
        // case "removeview":
        //     topicname = data.shift();
        //     var viewFolderName = data.shift();
        //     removeViewInTopic(topicname, viewFolderName);
        //     connection.send("removeview " + "200");
        //     sendSkylineUpdate("removeview");
        //     break;

        // "removemodule" is requested by the control panel, this method will remove a module directory from the file, it will also remove all connections to that module in the JSON configuration file
      case "removemodule":
        var modulefolder = data.shift();
        if (!RemoveModuleHandler.removeModule(modulefolder)) {
          console.warn((new Date()) + ' Failed removing module ' + modulefolder + '.');
          connection.send("removemodule 400");
          return;
        }
        console.log((new Date()) + ' Succeeded removing module ' + modulefolder + '.');
        connection.send("removemodule 200");
        sendSkylineUpdate("removemodule");
        break;

        // "getmodules" is requested by the control panel, this message will return a json object containing all modules with their information
      case "getmodules":
        connection.send("getmodules " + JSON.stringify(GetModulesHandler.getModules()));
        break;

      case "settopic":
        topicname = data.shift();
        if (!SetTopicHandler.setTopic(topicname)) {
          console.warn((new Date()) + ' Failed to set topic to \"' + topicname + '\".');
          connection.send("settopic 400");
          return;
        }
        console.log((new Date()) + ' Succeeded setting topic to \"' + topicname + '\".');
        connection.send("settopic 200");
        sendSkylineUpdate("settopic");
        break;

      case "getscreens":
        connection.send("getscreens " + JSON.stringify(GetScreensHandler.getScreens()));
        console.log((new Date()) + ' Succeeded sending screens.');
        break;

      case "addscreen":
        var screenObj = JSON.parse(data.join(" "));
        if (!AddScreenHandler.addScreen(screenObj)) {
          console.warn((new Date()) + ' Failed adding screen.');
          connection.send("addscreen 400");
          return;
        }
        console.log((new Date()) + ' Succeeded adding screen.');
        connection.send("addscreen 200");
        sendSkylineUpdate("addscreen");
        break;

      case "updatescreen":
        var newScreenObj = JSON.parse(data.join(" "));
        if (!UpdateScreenHandler.updateScreen(newScreenObj)) {
          console.warn((new Date()) + ' Failed updating screen.');
          connection.send("updatescreen 400");
          return;
        }
        console.log((new Date()) + ' Succeeded updating screen.');
        connection.send("updatescreen 200");
        sendSkylineUpdate("updatescreen");
        break;

      case "removescreen":
        var id = data.shift();
        if (!RemoveScreenHandler.removeScreen(id)) {
          console.warn((new Date()) + ' Failed removing screen.');
          connection.send("removescreen 400");
          return;
        }
        console.log((new Date()) + ' Succeeded removing screen.');
        connection.send("removescreen 200");
        sendSkylineUpdate("removescreen");
        break;

      case "updatetopic":
        var windowinfo = JSON.parse(data.join(" "));
        if (!UpdateTopicScreenHandler.updateTopicScreen(windowinfo)) {
          console.warn((new Date()) + ' Failed updating topic.');
          connection.send("updatetopic 400");
          return;
        }
        console.log((new Date()) + ' Succeeded updating topic.');
        connection.send("updatetopic 200");
        sendSkylineUpdate("updatetopic");
        break;

        // Should not get here (client error)
      default:
        console.warn((new Date()) + ' Received message of unknown type.');
        break;
    }
  });

  // When a client disconnects
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + " disconnected.");
    clients[index] = null;
    removeIdentification(co); //TODO: Test this!
  });
});

// Send a windowinfo message for a specific IP to a client
// function sendWindowInfoForIPToClient(client, ip, topic) {
//     assert.notEqual(client, undefined, "client can't be undefined");
//     assert.notEqual(ip, undefined, "ip can't be undefined");
//     assert.notEqual(ip, "", "ip can't be empty");
//
//     var validIPs = getScreenIPs();
//     // Finds out whenever this IP address is listen in our JSON file
//     if (validIPs.indexOf(ip) === -1) return false;
//     // Get screen where address is equal to ip
//     var json = getJSONfromPath(configPath).screens.filter(function(screen) {
//         return screen.address === ip;
//     })[0];
//     // Guard to make sure IP was in list
//     if (json === undefined) return false;
//     var windowinfoJSON = getWindowInfoForScreenConfig(json, topic);
//     client.send("windowinfo " + JSON.stringify(windowinfoJSON));
//     return true;
// }

// Send update message to all "identified" connections
function sendSkylineUpdate(change) {
  for (var i = 0; i < connectionList.length; i++) {
    if (connectionList[i] && connectionList[i].connection !== undefined) {
      connectionList[i].connection.send("skylineupdate " + change);
    }
  }
}

// // Send update message to all "identified" Displays
// function sendSkylineUpdateDisplays(change) {
//   if (change === undefined) change = "undefined";
//   for (var i = 0; i < connectionList.length; i++) {
//     if (connectionList[i] && connectionList[i].connection !== undefined) {
//       if (isDisplayScreen(connectionList[i].address)) connectionList[i].connection.send("skylineupdate " + change);
//     }
//   }
// }

// function isDisplayScreen(ip) {
//   assert.notEqual(ip, undefined, "ip can't be undefined");
//   assert.notEqual(ip, "", "ip can't be empty");
//
//   var iplist = getScreenIPs();
//
//   for (var i = 0; i < iplist.length; i++) {
//     if (iplist[i] === ip) return true;
//   }
//   return false;
// }

// Given a file name, return a json object
function getJSONfromPath(filename) {
  assert.notEqual(filename, "", "filename can't be empty");
  assert.notEqual(filename, undefined, "filename can't be undefined");

  try {
    var file = pathing.resolve('./' + filename);
    delete require.cache[file]; // Clear cache (otherwise files won't update)
    var json = require(file);
    return json;
  } catch (err) {
    console.error((new Date()) + ' ' + err);
    /*
    console.log("backup file to the rescue");
    var backup = require("./"+backupPath);
    turnJSONIntoFile(backup,"config.json");
    return backup;*/
  }
}

// Returns a list with directories given a path (callback is needed to get the path)
function readDirectories(path, callback) {
  assert.notEqual(path, undefined, "path can't be undefined");
  assert.notEqual(path, "", "path can't be empty");

  var listing = [];
  fs.readdir(path, function(err, list) {
    if (err) {
      console.error((new Date()) + ' ' + err);
    } else {
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (fs.lstatSync(path + "/" + item).isDirectory()) {
          listing.push(item);
        }
      }
    }
    return callback(listing);
  });
}

// Returns a list of the IP addresses of all DS screens
function getScreenIPs() {

  var json = getJSONfromPath(configPath);
  var list = [];
  for (var i = 0; i < json.screens.length; i++) {
    list.push(json.screens[i].address);
  }

  return list;
}

// Gets the windowinfo message for a screen config entry
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

// Gets the views list for a windowinfo message for a screen config entry
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

// used by getViewsForScreenConfig to retrieve all windows
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

// handles an upload of a new module
// This method should always be called when the config.json file is needed
function handleModuleUpload(req, res) {
  assert.notEqual(res, undefined, "res can't be undefined");
  assert.notEqual(req, undefined, "req can't be undefined");

  upload(req, res, function(err) {
    if (err) {
      //emptyTmp(fileName);
      console.error((new Date()) + ' ' + err);
      res.end("an error occured while uploading the file, please try again! Error-Code: UP01");
      return;
    }
    if (!req.file) {
      console.error((new Date()) + ' ' + "req.file is undefined.");
      return;
    }
    unzipFile(req.file.filename, res);
    return;
  });
}

function handleModuleDownload(req, res, fileName) {
  assert.notEqual(res, undefined, "res can't be undefined");
  assert.notEqual(req, undefined, "req can't be undefined");

  //var zip = new AdmZip();
  //zip.addLocalFolder("./modules/" + req.url.split('?')[1], "./" +req.url.split('?')[1] + "/");
  //res.end(zip.toBuffer(),'application/x-zip-compressed');
  var archive = archiver('zip');
  archive.on('error', function(err) {
    console.log((new Date()) + ' ' + err);
  });
  res.writeHead(200, {
     "Content-Disposition": "attachment;filename=" + fileName + ".zip",
     'Content-Type':   'application/x-zip-compressed',
   });
  archive.pipe(res);
  archive.bulk([{
    expand: true,
    cwd: "./modules/" + req.url.split('?')[1],
    src: ['**'],
    dest: req.url.split('?')[1]
  }]);
  archive.finalize();
}

//register the zip format.
mime.define({
  'application/x-zip-compressed': ['zip']
});

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './tmp');
  },
  filename: function(req, file, callback) {
    var name = file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    callback(null, name);
  }
});
var upload = multer({
  storage: storage
}).single('file');


//unzips a zip file to tmp folder.
function unzipFile(fileName, res) {
  assert.notEqual(fileName, "", "filename can't be empty");
  assert.notEqual(fileName, undefined, "filename can't be undefined");
  assert.notEqual(res, undefined, "res can't be undefined");

  var fromPath = 'tmp/' + fileName;

  //check to see if the file uploaded is a zip file.
  var splitFileName = fileName.split('.');
  if (splitFileName[splitFileName.length - 1] != 'zip') {
    //the file uploaded is not a zip file.
    removeFile(fromPath);
    res.end(splitFileName[splitFileName.length - 1] + ' type is not supported, only zip type files are currently supported (see documentation' + ' for more information).');
    return;
  }
  //the file is a zip
  var dir = './tmp/' + fileName + 'folder';
  mkdirp(dir, function(err) {
    if (err) {
      console.error((new Date()) + ' ' + err);
      res.end("An error occured while uploading the file, please try again! Error-code: UP02");
    } else {
      simpleUnzip(fromPath, dir);
      removeFile(fromPath); // removes the zip file.
      validateModule(dir, res);
    }
  });
}

//validate the Info.json file.
function validateModuleInfoJson(pathToFile, err) {
  assert.notEqual(pathToFile, "", "pathToFile can't be empty");
  assert.notEqual(pathToFile, undefined, "pathToFile can't be undefined");

  var info = getJSONfromPath(pathToFile + "info.json");
  if (info) {
    if (!info.name || !info.developer || !info.description || !info.license) {
      return err("The name, developer, description, license are required attributes in the info.json of the module.");
    }
    var allModuleInfo = DataManager.getAllModulesFull();
    for (var i = 0; i < allModuleInfo.length; i++) {
      if (allModuleInfo[i].name == info.name) {
        return err("The module name '" + info.name + "' already exists, consider changing the name in the info.json.");
      }
    }
    return err(undefined);
  } else {
    return err("The module doesn't have a info json file or it has errors, this file is required. Make sure it's located in the right place and it's valid.");
  }
}

function verifyWindows(path, res) {
  var dirs = getDirectories(path);
  for (var i = 0; i < dirs.length; i++) {
    var files = fs.readdirSync(pathing.join(path, dirs[i]));
    for (var j = 0; j < files.length; j++) {
      if (files[j] == "info.json") {
        console.log((new Date()) + ' ' + 'window  info.json found!');
        var valid = validateWindowJson(pathing.join(pathing.join(path, dirs[i]), files[j]), res);
        if (!valid) {
          return false;
        }
      }
    }
  }
  return true;
}
//validates the info.json of a window, optionnaly add aditional checks for the json file here.
function validateWindowJson(path, res) {
  var info = getJSONfromPath(path);
  if (!info) {
    res.end("The info.json of the window contains errors, please validate this file and try again!");
    return false;
  }
  if (!info.name || !info.description) {
    res.end("The info.json of a window needs to have the name and description attribute.");
    return false;
  }
  if (!info.preferredShape || !info.htmlUrl) {
    res.end("The preferredShape and htmlUrl attribute are required in the info.json of a window.");
    return false;
  }
  return true;
}

function verifyViews(path, res) {
  var viewArray = [];
  var dirs = getDirectories(path);
  for (var i = 0; i < dirs.length; i++) {
    var files = fs.readdirSync(pathing.join(path, dirs[i]));
    for (var j = 0; j < files.length; j++) {
      if (files[j] == "info.json") {
        console.log((new Date()) + ' ' + 'view found info.json found!');
        var valid = validateViewJson(pathing.join(pathing.join(path, dirs[i]), files[j]), res);
        if (!valid) {
          return false;
        }
        viewArray.push(pathing.join(path, dirs[i]));
      }
    }
  }
  for (var i = 0; i < viewArray.length; i++) {
    var success = verifyWindows(viewArray[i], res);
    if (!success) {
      return false;
    }
  }
  return true;
}
//validates a json of a view, optionnaly add aditional checks for the json file of a view here.
function validateViewJson(path, res) {
  var info = getJSONfromPath(path);
  if (!info) {
    res.end("The info.json of the view contains errors please validate this file.");
    return false;
  }
  if (!info.name || !info.description) {
    res.end("The info.json of the view doesn't have the name and/or description attribute, make sure this info.json file is valid.");
    return false;
  }
  if (!info.jsProgramUrl) {
    res.end("The info.json of the view needs to have a jsProgramUrl attribute, if the view doesn't use a js file then use a empty string ('jsProgramUrl' : '').");
    return false;
  }
  if (!info.configTemplate || !info.configTemplate.configItems) {
    res.end("The info.json of the view needs to have the configTemplate attribute. This attribute has a array named configItems. If theres nothing to configure, use an empty array.");
    return false;
  }
  return true;

}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(pathing.join(srcpath, file)).isDirectory();
  });
}

//validates a module for a given path
function validateModule(pathToModule, res) {
  assert.notEqual(pathToModule, "", "pathToModule can't be empty");
  assert.notEqual(pathToModule, undefined, "pathToModule can't be undefined");
  assert.notEqual(res, undefined, "res can't be undefined");

  //reads the content of the folder
  fs.readdir(pathToModule, function(err, files) {
    if (err) {
      console.error((new Date()) + ' ' + err);
      res.end("An error occured while uploading the file, please try again! Error-code: UP03");
      return;
    }
    //Checks to see if it the module is in one top folder.
		// Little workaround added 2016-09-20 by Steyn Potze:
		// Sometimes computers add some hidden files and folders to the file system
		// to store user preferences or indexing data. Though we do not permit other
		// folders than the module itself in the root of the zip file, we cannot ask
		// the user to remove these hidden files and folders himself. The code below
		// filters out these files and folders. Should you come across other automatically
		// generated hidden files, you can add them to the if statement below.
		var filteredFiles = [];
		for (var i in files) {
			if (files[i] !== "__MACOSX" && files[i] !== ".DS_Store" && files[i] !== "thumbs.db" && files[i] !== "desktop.ini") {
				filteredFiles.push(files[i]);
			}
		}
    if (filteredFiles.length != 1) {
      console.error((new Date()) + ' ' + "Error invalid module structure: files are not in the same folder. Make sure there weren't any extra folders created in the top level.");
      removeDir(pathToModule, function(success) {

      });
      res.end("Error the structure of the module is not valid, the top level of the archive can only contain one folder (and no files)." + "See the documentation for more information.");
      return;
    }
    //check the info json of the module..
    validateModuleInfoJson(pathToModule + "/" + filteredFiles[0] + "/", function(err) {
      if (err) {
        console.error((new Date()) + ' ' + "Incompatible info.json");
        res.end(err);
        removeDir(pathToModule, function(success) {

        });
        return;
      }
      var ok = verifyViews(pathToModule + "/" + filteredFiles[0] + "/", res);
      if (!ok) {
        console.error((new Date()) + ' ' + "Incompatible info.json in view or window");
        removeDir(pathToModule, function(success) {

        });
        return;
      }
      //check to see if the module folder already exists in the system.
      fs.stat('modules/' + filteredFiles[0], function(err, stats) {
        if (err) {
          //succes module doesnt exist.
          fs.rename(pathToModule + '/' + filteredFiles[0], 'modules/' + filteredFiles[0], function(err) { //optionnaly change to name in info.json
            if (err) {
              console.error((new Date()) + ' ' + err);
              res.end("An error has occured while uploading your module. Error-code: UP04");

            } else {
              //module is added to the system
              res.end("200");
              sendSkylineUpdate('uploadmodule');
            }
            removeDir(pathToModule, function(success) {

            }); //remove the leftover files from the tmp folder.

          });
          return;
        }

        console.warn((new Date()) + ' ' + " This module already exists!");
        removeDir(pathToModule, function(success) {

        });
        res.end("A module with the folder name " + filteredFiles[0] + " already exists, consider renaming the folder with the contents of the module.");

      });

    });


  });
}
//unzips a zip file to a given path.
function simpleUnzip(fromPath, toPath) {
  assert.notEqual(fromPath, "", "fromPath can't be empty");
  assert.notEqual(fromPath, undefined, "fromPath can't be undefined");
  assert.notEqual(toPath, "", "toPath can't be empty");
  assert.notEqual(toPath, undefined, "toPath can't be undefined");

  var zip = new AdmZip(fromPath);
  zip.extractAllTo(toPath, true);
}
//removes a single file.
function removeFile(fromPath) {
  assert.notEqual(fromPath, "", "fromPath can't be empty");
  assert.notEqual(fromPath, undefined, "fromPath can't be undefined");

  fs.unlink(fromPath, function(err) {
    if (err) console.log(err);
  });
}

//removes a dir with the content within this dir.
function removeDir(path, callback) {
  assert.notEqual(path, "", "path can't be empty");
  assert.notEqual(path, undefined, "path can't be undefined");

  rmdir(path, function(err, dirs, files) {
    if (err) {
      console.error((new Date()) + ' ' + err);
      return callback(false);
    }
    return callback(true);
  });
}

// TODO: Send update to Cpanel and Touch interface (Or everyone)
// Adds a topic to the config
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

// TODO: Send update to Cpanel and Touch interface (Or everyone)
// removes a topic from the configuration JSON file given a topicname
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

// adds a "view" to the topic given a topicname and a JSON object that needs to be inserted (JSON file should contain a "view")
// TODO: Test these assertions
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

//TODO: Make the return type Boolean!
// removes a view from the selected topic given a topicname and a viewFolderName
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

// TODO: Send message to all dislay screens with an update
// Updates the current selected topic
// function updateCurrentTopic(topicname) {
//     assert.notEqual(topicname, "", "Topicname can't be empty");
//     assert.notEqual(topicname, undefined, "Topicname can't be undefined");
//     // check if topicname exists
//     var json = getJSONfromPath(configPath);
//     for (var i = 0; i < json.topics.length; i++) {
//         if (json.topics[i].name === topicname) {
//             // set topic and return true if found
//             selectedTopic = topicname;
//             return true;
//         }
//     }
//     console.error((new Date()) + ' ' + topicname + " does not exist");
//     // return false if topic does not exist
//     return false;
// }

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

//TODO: rename this method (returnModuleList)
// Returns list with all modules in the modules directory (callback needed for list)

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

// Returns all topics in JSON format
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
// var obj = {
//     "thingOne": 1,
//     "thingTwo": 2
// };

// given a JSON object and a filename, create a JSON file
function turnJSONIntoFile(jsonObj, filename) {
  fs.writeFileSync(filename, JSON.stringify(jsonObj), 'utf8');
  /*
  fs.writeFile(filename,JSON.stringify(jsonObj), function(err) {
    if(filename === configPath){
      console.log("Hello");
        fs.writeFile(backupPath,JSON.stringify(jsonObj), function(err) {
          if(err) return console.error(err);

          console.log(backupPath+ " created!");
        });
    }
    if(err) return console.error(err);
    console.log(filename+" created!");
  });*/
}

// returns list with all screens
// function getScreenList() {
//     var config = getJSONfromPath(configPath);
//     return config.screens;
// }

// "Object" for connections
function ConnectionObject(connection, address) {
  assert.notEqual(connection, undefined, "connection can't be undefined");
  assert.notEqual(address, undefined, "address can't be undefined");
  assert.notEqual(address, "", "address can't be empty!");

  this.connection = connection;
  this.address = address;
}

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

function identifyConnection(co) {
  assert.notEqual(co, undefined, "co can't be undefined");

  for (var i = 0; i < connectionList.length; i++) {
    if (connectionList[i] && co.address === connectionList[i].address) {
      console.log((new Date()) + ' ' + "Duplicate IP, Overwriting!");
      connectionList[i].connection = co.connection;

      assert.notEqual(connectionList[i].connection, undefined, "Something went wrong while adding the connection");
      return true;
    }
  }
  if (connectionList.length <= maxConnections) {
    connectionList.push(co);
    return true;
  } else {
    console.warn((new Date()) + ' ' + "Max client limit reached!");
    return false;
  }
}

function removeIdentification(co) {
  assert.notEqual(co, undefined, "co can't be undefined");

  for (var i = 0; i < connectionList.length; i++) {
    if (connectionList[i] && co.address === connectionList[i].address) {
      connectionList[i].connection = undefined;
      return true;
    }
  }
  return false;
}

function alreadyIdentified(ip) {
  for (var i = 0; i < connectionList.length; i++) {
    if (connectionList[i] && connectionList[i].connection !== undefined) {
      if (connectionList[i].address === ip) {
        return true;
      }
    }
  }
  return false;
}

//TODO: Verander "IPs" bijhouden systeem
