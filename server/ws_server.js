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
var configPath = "config.json";
var selectedTheme = (getJSONfromPath(configPath).themes[0].themeName || "none");

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
      // Identify yourself
      case "identification" :
          var address = data.shift();
          connectionList[index] = new ConnectionObject(connection,address);
          break;
      // "requestwindows" is send by a display screen, when the switch matches this command, it'll send back the correct information for that display screen
      case "requestwindows":
          var ipAddress = data.shift();
          var specifictheme = data.shift(); // [Optional]
          addWorkAddress(connection,ipAddress);
          if(specifictheme === undefined) {
            console.log((sendWindowInfoForIPToClient(connection, ipAddress) ? "Succeeded" : "Failed") + " at sending windowinfo for " + ipAddress + " to client.");
          } else {
            console.log((sendWindowInfoForIPToClient(connection, ipAddress,specifictheme) ? "Succeeded" : "Failed") + " at sending windowinfo for " + ipAddress + " to client.");
          }
          break;
      // "getthemes" is requested by the control panel, it will return the themelist from the JSON configuration file
      case "getthemes":
          var themes = JSON.stringify(getThemeList());
          connection.send("getthemes " + themes);
            break;
      // "addview" is requested by the control panel, it will give a JSON object (containing a view) that needs to be added to the configuration JSON file.
      case "addview":
          var themename = data.shift();
          //TODO: Test this
          var returnedJSON = arrayToString(data);
          if(addViewToTheme(themename, returnedJSON)) {
            connection.send("addview " + "200");
            sendSkylineUpdate();
          } else {
            connection.send("addview " + "400");
          }
            break;
      // "addtheme" is requested by the control panel, it will need a themename and description, with this information, a new theme will be added to the configuration file
      case "addtheme":
          var themename = data.shift();
          var themedescription = arrayToString(data);
          if(addTheme(themename,themedescription)) {
            connection.send("addtheme " + "200");
            sendSkylineUpdate();
          } else {
            connection.send("addtheme " + "400");
          }
            break;
      // "removetheme" is requested by the control panel, it will remove a theme from the configuration JSON file given a themename
      case "removetheme" :
          var themename = data.shift();
          if(removeTheme(themename)) {
            connection.send("removetheme " + "200");
            sendSkylineUpdate();
          } else {
            connection.send("removetheme " + "400");
          }
            break;
      case "removeview" :
          var themename = data.shift();
          var viewname = data.shift();
          removeViewInTheme(themename,viewname);
          connection.send("removeview " + "200");
          sendSkylineUpdate();
            break;
      // "removemodule" is requested by the control panel, this method will remove a module directory from the file, it will also remove all connections to that module in the JSON configuration file
      case "removemodule" :
          var modulefolder = data.shift();
          removeModule(modulefolder , function callback(success) {
            if(success){
              connection.send("removemodule " + "200");
              sendSkylineUpdate();
            } else {
              connection.send("removemodule " + "400");
            }
          });
            break;
      // "getmodules" is requested by the control panel, this message will return a json object containing all modules with their information
      case "getmodules" :
            sendModuleList(function(obj) {
              connection.send("getmodules "+JSON.stringify(obj));
            });
            break;
      // "settheme: is requested by the touchpanel, when a "ball" is clicked, this message is called which will update all screens
            // TODO: send update to all display screens (here or in updateCurrentTheme method)
      case "settheme" :
            var themename = data.shift();
            if(updateCurrentTheme(themename)) {
              connection.send("settheme " + "200");
              sendSkylineUpdate();
            } else {
              connection.send("settheme " + "400");
            }
            break;
      case "getscreens" :
          connection.send("getscreens " + JSON.stringify(getScreenList()));
            break;
      // Should not get here (client error)
      default:
          console.error("This message doesn't exist?");
          break;
    }
  });

  // When a client disconnects
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' - Peer ' + connection.remoteAddress + ' disconnected with index: ' + index);
    clients[index] = null;
    connectionList[index] = null;
    logClientList();
  });
});

console.dir(JSON.stringify(getThemeList()))

// Send a windowinfo message for a specific IP to a client
function sendWindowInfoForIPToClient(client, ip, theme) {
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

function sendSkylineUpdate() {
  for(var i = 0 ; i < connectionList.length ; i++ ){
    connectionList[i].connection.send("skylineupdate");
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

// Given a file name, return a json object
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

// Returns a list with directories given a path (callback is needed to get the path)
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
function getWindowInfoForScreenConfig(jsonfile,specifictheme) {
  var themes = getJSONfromPath(configPath).themes;
  var obj = {
    "screenName": jsonfile.screenName,
    "screenWidth": jsonfile.screenWidth,
    "screenHeight": jsonfile.screenHeight,
    "views": getViewsForScreenConfig(jsonfile,themes,specifictheme)
  };
  return obj;
}

// Gets the views list for a windowinfo message for a screen config entry
function getViewsForScreenConfig(jsonfile,themes,specifictheme) {
  var results = [];
  for (var i = 0; i < themes.length; i++) {
    if(specifictheme === undefined){
      if(themes[i].themeName === selectedTheme){
        for(var j = 0; j < themes[i].screenViews.length ; j++){
          var viewjson = getJSONfromPath("modules/" + themes[i].screenViews[j].screenParentModule + "/" + themes[i].screenViews[j].viewName + "/info.json");
          if (viewjson === undefined) continue; // If json file couldn't be read (wrong information in JSON file) then proceed to next
          var windowinfo = allWindows(themes[i].screenViews[j], jsonfile);
          if(windowinfo.length === 0) continue;
          var obj = {
            "viewName": themes[i].screenViews[j].viewName,
            "parentModule": themes[i].screenViews[j].screenParentModule,
            "managerUrl": viewjson.viewJavascriptReference,
            "windows": windowinfo
          };
          results.push(obj);
        }
      }
    } else {
      if(themes[i].themeName === specifictheme){
        for(var j = 0; j < themes[i].screenViews.length ; j++){
          var viewjson = getJSONfromPath("modules/" + themes[i].screenViews[j].screenParentModule + "/" + themes[i].screenViews[j].viewName + "/info.json");
          if (viewjson === undefined) continue; // If json file couldn't be read (wrong information in JSON file) then proceed to next
          var windowinfo = allWindows(themes[i].screenViews[j], jsonfile);
          if(windowinfo.length === 0) continue;
          var obj = {
            "viewName": themes[i].screenViews[j].viewName,
            "instanceName": themes[i].screenViews[j].instanceName,
            "parentModule": themes[i].screenViews[j].screenParentModule,
            "managerUrl": viewjson.viewJavascriptReference,
            "windows": windowinfo
          };
          results.push(obj);
        }
      }
    }
  }
  return results;
}

// used by getViewsForScreenConfig to retrieve all windows
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
      "dsWindow":jsonSC.screenComponents[i].dsWindow,
      "coordX": screenjson.windowCoordX,
      "coordY": screenjson.windowCoordY,
      "htmlUrl": windowjson.windowHtmlReference
    };
    results.push(obj);
  }
  console.log(results);
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

// TODO: Send update to Cpanel and Touch interface (Or everyone)
// Adds a theme to the config
function addTheme(themename, themedescription) {
    assert.notEqual(themename, undefined, "themename can't be undefined");
    assert.notEqual(themename, "","themename can't be empty");

    assert.notEqual(themedescription, undefined, "themedescription can't be undefined");
    assert.notEqual(themedescription, "","themedescription can't be empty");

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
  turnJSONIntoFile(config,"config.json");
  return true;
}

// TODO: Send update to Cpanel and Touch interface (Or everyone)
// removes a theme from the configuration JSON file given a themename
function removeTheme(themename) {
  assert.notEqual(themename, "", "themename is empty");
  assert.notEqual(themename, undefined, "themename is undefined");

  var config = getJSONfromPath(configPath);
  var newlist = [];
  for(var i = 0 ; i < config.themes.length ; i++) {
    if(config.themes[i].themeName !== themename) {
      newlist.push(config.themes[i]);
    }
  }
  config.themes = newlist;
  turnJSONIntoFile(config,"config.json");
  return true;
}

// TODO: Send update to everyone
// Removes a module directory and all connections to it
function removeModule(foldername , callback) {
  assert.notEqual(foldername, "" , "foldername can't be empty");
  assert.notEqual(foldername, undefined , "foldername can't be undefined");

  readDirectories("modules", function(directory) {
    for(var i = 0 ; i  < directory.length ; i++) {
      if(directory[i] === foldername) {
        var config = getJSONfromPath("config.json");
        var themes = config.themes;
        for(var j = 0 ; j < themes.length ; j ++) {
          var newlist = [];
          for(var k = 0; k < themes[j].screenViews.length ; k++ ) {
            if(themes[j].screenViews[k].screenParentModule !== foldername) {
              newlist.push(themes[j].screenViews[k]);
            }
          }
          themes[j].screenViews = newlist;
        }
        turnJSONIntoFile(config , "config.json");
        removeDir("./modules/"+foldername);
        return callback(true);
      }
    }
    console.error(foldername+" was not found!");
    return callback(false);
  });
}

// TODO: Send update to everyone
// adds a "view" to the theme given a themename and a JSON object that needs to be inserted (JSON file should contain a "view")
// TODO: Test these assertions
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
      turnJSONIntoFile(config,"config.json");
      return true;
    }
  }
  console.error("Theme '" + themename + "' does not exist in the JSON file!");
  return false ;
}

// TODO: Send update to everyone
//TODO: Make the return type Boolean!
// removes a view from the selected theme given a themename and a viewname
function removeViewInTheme(themename, viewname) {

  assert.notEqual(themename, "", "Themename can't be empty");
  assert.notEqual(themename, undefined, "Themename can't be undefined");
  assert.notEqual(viewname, "", "Viewname can't be empty");
  assert.notEqual(viewname, undefined, "Viewname can't be undefined");

  var config = getJSONfromPath(configPath);
  var themes = config.themes;
  for(var i = 0 ; i < themes.length ; i++) {
    if(themes[i].themeName === themename) {
      var newscreenviews = [];
      for(var j = 0 ; j < themes[i].screenViews.length ; j++ ){
        if(themes[i].screenViews[j].viewName !== viewname) {
          newscreenviews.push(themes[i].screenViews[j]);
        }
      }
      themes[i].screenViews = newscreenviews;
    }
  }
  turnJSONIntoFile(config, "config.json");
  console.log("Finish!");
  return;
}

// TODO: Send message to all dislay screens with an update
// Updates the current selected theme
function updateCurrentTheme(themename) {
  assert.notEqual(themename, "" , "Themename can't be empty");
  assert.notEqual(themename, undefined, "Themename can't be undefined");
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

//TODO: rename this method (returnModuleList)
// Returns list with all modules in the modules directory (callback needed for list)
function sendModuleList(callback) {
  readDirectories("modules", function(list) {
    var modulelist = [];
    for(var i = 0 ; i < list.length ; i++) {
      var info = getJSONfromPath("modules/"+list[i]+"/"+"info.json");
      var obj = {
        "folderName" : list[i],
        "moduleName" : info.moduleName,
        "moduleDescription" : info.moduleDescription,
        "moduleDeveloper" : info.moduleDeveloper,
        "moduleLicense" : info.moduleLicense
      }
      modulelist.push(obj);
    }
    var finalobj = {
      "modules" : modulelist
    };
    return callback(finalobj);
  });
}

// Returns all themes in JSON format
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

function arrayToString(array) {
  var string = "";
  for(var i = 0 ; i < array.length ; i++) {
    string += array[i]+ " ";
  }
  return string.substring(0,string.length-1);
}

// given a JSON object and a filename, create a JSON file
function turnJSONIntoFile(jsonObj, filename) {
  fs.writeFile(filename,JSON.stringify(jsonObj), function(err) {
    if(err) return console.log(err);
    console.log(filename+" created!");
  });
}

// returns list with all screens
function getScreenList() {
  var config = getJSONfromPath(configPath);
  return config.screens;
}

// "Object" for connections
function ConnectionObject(connection, address) {
  this.connection = connection;
  this.address = address;
}

//TODO: IPV 200 sturen kunnen we ook gewoon een algemene "refresh" response sturen naar alle clients!

//TODO: Client moet "identification" bericht sturen wanneer je verbinding legt met de server