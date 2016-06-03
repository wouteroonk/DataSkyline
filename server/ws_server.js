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

// The selected dataskyline theme
var selectedTheme = "default";
var configPath = "config.json";

// list of currently connected clients (users)
var clients = [];
var connectionList = [];

//Where we store our local config json files
// C:/Users/Gebruiker/Desktop/DataSkyline/server/ on production DataSkyline
// TODO: Is this still needed?
var localPathToConfigs = "C:/Users/Gebruiker/Desktop/DataSkyline/server/";

//Count of currently connected clients
var connectionCount = 0;

//Max amount of connected clients allowed
var maxConnections = 7;

//Construct HTTP server
// The HTTP server allows clients to talk to the DataSkyline server using the HTTP protocol.
// In this instance, the HTTP server is used to serve the control panel and is used in the websocket server.
var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);

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
    handleModuleUpload(request, response);
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
          '.js': 'text/javascript'
        }[filteredUrl.substr(dotoffset)];
        // Set the content type and write the file
        response.setHeader('Content-type', mimetype);
        response.end(data);

        console.log(filteredUrl, mimetype);
      } else {
        // File does not exist
        console.log('file not found: ' + filteredUrl);
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
        console.log("Rejecting connection: too many connections");
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
    console.log('Connection from origin ' + request.remoteAddress + ' rejected.');
    return;
  }

  // TODO: What is "echo-protocol"?
  var connection = request.accept('echo-protocol', request.origin);
  var index = connectionCount; //Assign index to new connection
  clients[index] = connection; //Add to client list

  console.log((new Date()) + ' - Connection accepted from ' + connection.remoteAddress + " with index " + index);
  logClientList();

  // When a message is received
  connection.on('message', function(message) {
    var data = message.utf8Data.split(' ');

    // Get the message type and perform matching action
    switch (data.shift()) {
      case "requestwindows":
        var ipAddress = data.shift();
        connectionList[index] = new ConnectionObject(connection,ipAddress);
        console.log((sendWindowInfoForIPToClient(connection, ipAddress) ? "Succeeded" : "Failed") + " at sending windowinfo for " + ipAddress + " to client.");
        break;
      case "getthemes":
          var themes = JSON.stringify(getThemeList());
          connection.send("allthemes " + themes);
            break;
      case "addview":
          if(addViewToTheme(data.shift(), data.shift())) {
            connection.send("status " + "OK");
          } else {
            connection.send("status " + "ERROR");
          }
            break;
      case "newtheme":
          if(addTheme(data.shift(),data.shift())) {
            connection.send("status " + "OK");
          } else {
            connection.send("status " + "ERROR");
          }
            break;
      case "removetheme" :
            if(removeTheme(data.shift())) {
              connection.send("status " + "OK");
            } else {
              connection.send("status " + "ERROR");
            }
      default:
        // Handle false message
        break;
    }
  });

  // Client disconnects
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' - Peer ' + connection.remoteAddress + ' disconnected with index: ' + index);
    clients[index] = null;
    connectionList[index] = null;
    // TODO: Shouldn't we lower connectionCount?
    logClientList();
  });

});

console.dir(JSON.stringify(getThemeList()))

// Send a windowinfo message for a specific IP to a client
function sendWindowInfoForIPToClient(client, ip) {
  var validIPs = getScreenIPs();
  // Finds out whenever this IP address is listen in our JSON file
  if (validIPs.indexOf(ip) === -1) return false;
  // Get screen where screenAddress is equal to ip
  var json = getJSONfromPath(configPath).screens.filter(function(screen) {
    return screen.screenAddress === ip;
  })[0];
  // Guard to make sure IP was in list
  if (json === undefined) return false;
  var windowinfoJSON = getWindowInfoForScreenConfig(json);
  client.send("windowinfo " + JSON.stringify(windowinfoJSON));
  return true;
}

//Broadcast message to all connected clients
function broadcastMessage(command, message) {
  for (var i = 0; i < clients.length; i++) {
    if (clients[i]) {
      clients[i].sendUTF(command + " " + message);
    }
  }
}

// This function updates all screens!
// TODO: This function currently does not work.
// This function does not work, because we don't know the IP address for a connection. TODO:(we DO actually have the connection with an IP)
// Proposed fix:
//  * add setmyip message for clients in which they set their IP
//  * expand requestwindows message with zero parameters variant, where the connections set IP is used.
function sendUpdateNotification() {
  var iplist = getScreenIPs();
  console.log("CONNECTIONLIST: " + connectionList);
  for (var i = 0; i < connectionList.length; i++) {
    if (connectionList[i]) {
      console.dir("Connection " + i);
      sendWindowInfoForIPToClient(connectionList[i].connection, connectionList[i].address);
    }
  }
}

// Iterate over & log all connected clients
function logClientList() {
  console.log("Current connected clients: ");
  console.log("index : address");
  for (var i = 0; i < clients.length; i++) {
    if (clients[i]) {
      console.log(i + "     : " + clients[i].remoteAddress);
      //Note: remoteAddresses might start with "::ffff:"
      //This is an ipv4 address expressed through ipv6
    }
  }
  console.log("------");
}

function getJSONfromPath(filename) {
  try {
    var file = pathing.resolve('./' + filename);
    delete require.cache[file]; // Clear cache (otherwise files won't update)
    var json = require(file);
    return json;
  } catch (err) {
    return undefined;
  }


}

function readDirectories(path, callback) {
  var listing = [];
  fs.readdir(path, function(err, list) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (fs.lstatSync(path + "/" + item).isDirectory()) {
          console.log(item);
          listing.push(item);
        }
      }
    }
    return callback(listing);
  });
}

// Gets a list of the IP addresses of all DS screens
function getScreenIPs() {
  console.log("Reading addresses from JSON");

  var json = getJSONfromPath(configPath);
  var list = [];
  for (var i = 0; i < json.screens.length; i++) {
    list.push(json.screens[i].screenAddress);
  }
  console.dir(list);
  return list;
}

// Gets the windowinfo message for a screen config entry
function getWindowInfoForScreenConfig(jsonfile) {
  var themes = getJSONfromPath(configPath).themes;
  var obj = {
    "screenName": jsonfile.screenName,
    "views": getViewsForScreenConfig(jsonfile,themes)
  };
  return obj;
}

// Gets the views list for a windowinfo message for a screen config entry
function getViewsForScreenConfig(jsonfile,themes) {
  var results = [];
  for (var i = 0; i < themes.length; i++) {
    if(themes[i].themeName === selectedTheme){
      for(var j = 0; j < themes[i].screenViews.length ; j++){
        var viewjson = getJSONfromPath("modules/" + themes[i].screenViews[j].screenParentModule + "/" + themes[i].screenViews[j].viewName + "/info.json");
        if (viewjson === undefined) continue; // If json file couldn't be read (wrong information in JSON file) then proceed to next
        var windowinfo = allWindows(themes[i].screenViews[j], jsonfile);
        var obj = {
          "viewName": themes[i].screenViews[j].viewName,
          "parentModule": themes[i].screenViews[j].screenParentModule,
          "managerUrl": viewjson.viewJavascriptReference,
          "windows": allWindows(themes[i].screenViews[j], jsonfile)
        };
        if(windowinfo.length === 0) continue;
        results.push(obj);
      }
    }


  }
  return results;
}

function allWindows(jsonSC, jsonfile) {
  var results = [];
  for (var i = 0; i < jsonSC.screenComponents.length; i++) {
    var windowjson = getJSONfromPath("modules/" + jsonSC.screenComponents[i].viewWindow + "/info.json");
    if (windowjson === undefined) continue; // If json file couldn't be read (wrong information in JSON file) then proceed to next
    var screenjson = undefined;
    for (var j = 0; j < jsonfile.screenWindows.length; j++) {
      if (jsonfile.screenWindows[j].windowIdentifier === jsonSC.screenComponents[i].dsWindow) {
        screenjson = jsonfile.screenWindows[j];
      }
    }

    if(screenjson === undefined) continue;
    var obj = {
      "name": windowjson.windowName,
      "type": screenjson.windowShape,
      "pixelWidth": screenjson.windowPixelWidth,
      "pixelHeight": screenjson.windowPixelHeight,
      "coordX": screenjson.windowCoordX,
      "coordY": screenjson.windowCoordY,
      "htmlUrl": windowjson.windowHtmlReference
    };
    results.push(obj);
  }
  return results;
}

// handles an upload of a new module
// This method should always be called when the config.json file is needed
function handleModuleUpload(req, res) {
  upload(req, res, function(err) {
    if (err) {
      //emptyTmp(fileName);
      notifyUser("an error occured while uploading the file, please try again! Error-Code: UP01", res);
      return;
    }
    unzipFile(req.file.filename, res);
    return;
  });
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
}).single('new-module');


//unzips a zip file to tmp folder.
function unzipFile(fileName, res) {
  var fromPath = 'tmp/' + fileName;

  //check to see if the file uploaded is a zip file.
  var splitFileName = fileName.split('.');
  if (splitFileName[splitFileName.length - 1] != 'zip') {
    //the file uploaded is not a zip file.
    removeFile(fromPath);
    notifyUser(splitFileName[splitFileName.length - 1] + ' type is not supported, only zip type files are currently supported(see documentation' + ' for more information).', res);
    return;
  }
  //the file is a zip
  var dir = './tmp/' + fileName + 'folder';
  mkdirp(dir, function(err) {
    if (err) {
      console.log(err);
      notifyUser("an error occured while uploading the file, please try again! Error-code: UP02", res);
    } else {
      simpleUnzip(fromPath, dir);
      removeFile(fromPath); // removes the zip file.
      validateModule(dir, res);
    }
  });
}
//validates a module for a given path
function validateModule(pathToModule, res) {
  console.log("validating module " + pathToModule);
  //reads the content of the folder
  fs.readdir(pathToModule, function(err, files) {
    if (err) {
      console.log(err);
      notifyUser("An error occured while uploading the file, please try again! Error-code: UP03", res);
      return;
    }
    //Checks to see if it is a valid module
    if (files.length != 1) {
      console.log("Error invalid module structure: files are not in the same folder");
      removeDir(pathToModule);
      notifyUser("Error the structure of the module is not valid, the top level of the archive can only contain one folder (and no files)." + "See the documentation for more information.", res);
      return;
    }
    //check to see if the module already exists in the system
    fs.stat('modules/' + files[0], function(err, stats) {
      if (err) {
        //succes module doesnt exist.
        fs.rename(pathToModule + '/' + files[0], 'modules/' + files[0], function(err) { //optionnaly change to name in info.json
          if (err) {
            console.log(err);
            notifyUser("An error has occured while uploading your module. Error-code: UP04", res);

          } else {
            //module is added to the system
            notifyUser("The module: " + files[0] + " is added to the system and ready for use.", res);
          }
          removeDir(pathToModule); //remove the leftover files from the tmp folder.

        });
        return;
      }

      console.log("module already exists!");
      removeDir(pathToModule);
      notifyUser("A module with this name already exists, consider re-naming this module or removing the existing module.", res);

    });
  });
}
//unzips a zip file to a given path.
function simpleUnzip(fromPath, toPath) {
  var zip = new AdmZip(fromPath);
  zip.extractAllTo(toPath, true);
}
//removes a single file.
function removeFile(fromPath) {
  fs.unlink(fromPath, function(err) {
    if (err) console.log(err);
  });
}

//removes a dir with the content within this dir.
//TODO: Make return type boolean (To check if removal succeeded)
function removeDir(path) {
  rmdir(path, function(err, dirs, files) {
    if (err) {
      console.log(err);
    }
    console.log(dirs);
    console.log(files);
    console.log('all files are removed');
  });
}

//sends a respond to a user.
function notifyUser(message, res) {
  res.end("<script>alert('" + message + "'); window.location = '/';</script>");
}

// Adds a theme to the config
function addTheme(themename, themedescription) {
    assert.notEqual(themename, undefined, "You must construct additional pilons!");
    assert.notEqual(themename, null, "You must construct additional pilons!");
    assert.notEqual(themename, "","You must construct additional pilons!");

    assert.notEqual(themedescription, undefined, "You must construct additional pilons!");
    assert.notEqual(themedescription, null, "You must construct additional pilons!");
    assert.notEqual(themedescription, "","You must construct additional pilons!");

  var config = getJSONfromPath(configPath);
  for(var i = 0 ; i < config.themes.length ; i++) {
    if(config.themes[i].themeName === themename) {
      console.error("Theme '" + themename + "' already exists in the JSON file!");
      return false;
    }
  }
  var theme = {
    "themeName": themename,
    "themeDescription": themedescription,
    "screenViews": []
  };
  config.themes[config.themes.length] = theme;
  turnJSONIntoFile(config,"test.json");
  return true;
}

function removeTheme(themename) {
  assert.notEqual(themename, "", "themename is empty");
  assert.notEqual(themename, undefined, "themename is undefined");

  var config = getJSONfromPath(configPath);
  for(var i = 0 ; i < config.themes.length ; i++) {
    if(config.themes[i].themeName === themename) {
      config.themes[i] = {};
      turnJSONIntoFile(config,"test.json");
      return;
    }
  }
  return console.error("Theme '" + themename + "' does not exist in the JSON file!");
}

// Do not use this function right now (will only delete half the required files!!!)
// TODO: Test this function!
function removeModule(mapname , callback) {
  readDirectories("modules", function(maps) {
    for(var i = 0 ; i  < maps.length ; i++) {
      if(maps[i] === mapname) {
        var themes = getJSONfromPath("config.json").themes;
        for(var themeobj in themes) {
          for(screenVieww in themeobj.screenViews){
            if(screenView.screenParentModule === mapname) {
              screenView = {};
            }
          }
        }
        turnJSONIntoFile(themes , "test.json");
        removeDir("modules/"+mapname);
        return callback(true);
      }
    }
    console.error(mapname+" was not found!");
    return callback(false);
  });
}

// use makeViewObject() to create viewobject!
function addViewToTheme(themename, viewjson) {
  assert.notEqual(themename, undefined,  "Themename is undefined");
  assert.notEqual(themename, "",  "Themename is empty");
  assert.notEqual(viewjson, undefined,  "view json file is undefined");
  var viewObj = viewjson;
  assert.notEqual(viewObj.screenName, undefined,  "ScreenName is undefined");
  assert.notEqual(viewObj.screenParentModule, undefined,  "ScreenParentModule is undefined");
  assert.notEqual(viewObj.screenConfigFile, undefined,  "ScreenConfigFile is undefined");
  assert.notEqual(viewObj.screenComponents, undefined,  "ScreenComponents is undefined");

  var config = getJSONfromPath(configPath);
  for(var i = 0 ; i < config.themes.length ; i++) {
    if(config.themes[i].themeName === themename) {
      config.themes[i].screenViews[config.themes[i].screenViews.length] = viewObj;
      turnJSONIntoFile(config,"test.json");
      return true;
    }
  }
  console.error("Theme '" + themename + "' does not exist in the JSON file!");
  return false ;
}
// medium PRIORITY
// TODO: Find a way to make Json Objects properly
function editViewInTheme(themename, viewID, jsonobj) {
  var config = getJSONfromPath(configPath);
}
// HIGH PRIORITY
function removeViewInTheme(themename, viewname) {
  var config = getJSONfromPath(configPath);
}

// HIGH PRIORITY
function addComponentsToView() {

}

function updateCurrentTheme(themename) {
  // check if themename exists
  var json = getJSONfromPath(configPath);
  for(var i = 0 ; i < json.themes.length ; i++){
    if(json.themes[i].themeName === themename) {
      // set theme and return true if found
      selectedTheme = themename;
      return true;
    }
  }
  console.error(themename + " does not exist");
  // return false if theme does not exist
  return false;
}

function sendModuleList() {
  readDirectories("modules", function(list) {
    //TODO: Send this array to the cpanel (maybe as JSON object?)
  });
}

function getThemeList() {
  var themes = getJSONfromPath(configPath).themes;
  var list = [];
  for(var i = 0 ; i < themes.length ; i++) {
    var listitem = {"name" : themes[i].themeName};
    list.push(listitem);
  }
  var obj = {
    "themes": list
  };
  return obj;
}


function turnJSONIntoFile(jsonObj, filename) {
  fs.writeFile(filename,JSON.stringify(jsonObj), function(err) {
    if(err) return console.log(err);
    console.log(filename+" created!");
  });
}

// "Object" for connections
function ConnectionObject(connection, address) {
  this.connection = connection;
  this.address = address;
}
