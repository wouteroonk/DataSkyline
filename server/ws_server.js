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
var AdmZip  = require("adm-zip");
var rmdir = require("rmdir");
var mkdirp = require("mkdirp");

// list of currently connected clients (users)
var clients = [];

//Where we store our local config json files
// C:/Users/Gebruiker/Desktop/DataSkyline/server/ on production DataSkyline
var localPathToConfigs = "C:/Users/Gebruiker/Desktop/DataSkyline/server/";

// TODO: Find out what this var is for so we can give it a better name
var globalIndex = 0;

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
  if(request.method == 'POST'){
    //for now there is no check for which path, it is assumed that all post requests are module uploads.
    handleModuleUpload(request, response);
  }
  // Serve control panel when root is accessed
  else if(filteredUrl === '/') {
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
    while (clients[globalIndex]) {
        if (globalIndex >= maxConnections - 1) {
            if (checked) {
                console.log("Rejecting connection: too many connections");
                allowed = false;
                checked = false;
                break;
            }
            globalIndex = -1;
            checked = true;
        }
        globalIndex++;
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
    var index = globalIndex; //Assign index to new connection
    clients[index] = connection; //Add to client list

    console.log((new Date()) + ' - Connection accepted from ' + connection.remoteAddress + " with index " + index);
    logClientList();

    // When a message is received
    connection.on('message', function(message) {
        var data = message.utf8Data.split(' ');
        var ip;
        var iplist = storeAddressesInList();
        // Find ip data from requestwindows
        for (var i = 0; i < data.length; i++) {
            // REQUEST WINDOWS
            if (data[i] === 'requestwindows') {
                ip = data[i + 1];
                // Go through ip list and check if
                var foundIP = false;

                for (var j = 0; j < iplist.length; j++) {
                    if (iplist[j] === ip) {
                        foundIP = true;
                        console.log((new Date()) + " received valid connection from " + ip);
                        var jsonfile;
                        var jsonlist = readJsonInDirectory("config.json");
                        // Get the correct JSON object from the JSON file and store in jsonfile.
                        for (var k = 0; k < jsonlist.length; k++) {
                            if (jsonlist[k].screenAddress === ip) {
                                jsonfile = jsonlist[k];
                            }
                        }
                        // Make sure the JSON file contains data
                        if (jsonfile !== undefined) {
                            var finalObject = makeJsonViewFile(jsonfile);
                            //console.log("JSON has been made");
                            connection.send("windowinfo " + JSON.stringify(finalObject));
                        } else {
                            // If this error is thrown it means that the JSON file couldn't find the IP address
                            throw new Error("Can't find ip address in json file");
                        }
                    }
                }
                // Check if there was a valid IP address, if not tell the console that an unknown IP address tried to connect
                if (!foundIP) {
                    console.log((new Date()) + " received connection from unknown ip address " + ip);
                    connection.sendUTF("Error: Unknown ip address " + ip);
                }

            } else if (data[i] === 'something else') {
                // Do something
            }
        }

        /*    if (message.type === 'utf8') {
         console.log((new Date()) + ' - Received Message: ' + message.utf8Data);
         }
         else {
         console.log("Error: received unknown data type");
         connection.sendUTF("Error: received unknown data type");
         }*/


        /*      //If '/change' command is received
         if (message.utf8Data.substring(0, 8) == "/change ") {
         //configName contains everything after the '/change ' (should be configname.json)
         var configName = message.utf8Data.substring(8, message.utf8Data.Length);

         // Load json config & broadcast message when loaded
         // TODO: Method name does not really make you assume JSON is being broadcast
         loadJSON(localPathToConfigs + configName, true);

         }
         // Show all existing configs
         else if (message.utf8Data.substring(0, 11) == "/getconfigs") {
         // TODO: Fix method name
         fetchConfigs();
         }
         // Test
         else if (message.utf8Data.substring(0, 5) == "/test") {
         broadcastMessage("test", "this is only a test");
         }
         // Update config files
         else if (message.utf8Data.substring(0, 14) == "/updateconfig ") {
         //incomingData contains everything after the '/updateconfig ' (should be config name & body)
         // TODO: Rename var to "newConfigData" or something like that
         var incomingData = message.utf8Data.substring(14, message.utf8Data.Length);

         updateConfig(incomingData);
         }
         // Delete a config file
         else if (message.utf8Data.substring(0, 14) == "/deleteconfig ") {
         // TODO: Rename var to "filenameToDelete" or something like that
         var incomingData = message.utf8Data.substring(14, message.utf8Data.Length);

         deleteConfig(incomingData);
         }
         // Reject output
         else {
         console.log("Error: Unknown command: " + message.utf8Data);
         connection.sendUTF("Error: Unknown command: " + message.utf8Data);
         }
         }

         // We are receiving weird data.
         // TODO: Is it really neccessary to check if data is binary when we are going to throw an error anyway?
         else if (message.type === 'binary') {
         console.log("Error: received binary data of " + message.binaryData.length + " bytes");
         connection.sendUTF("Error: received binary data");
         }*/
        // Still receiving weird data.
    });

    // Client disconnects
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' - Peer ' + connection.remoteAddress + ' disconnected with index: ' + index);
        clients[index] = null;
        // TODO: Shouldn't we lower globalIndex?
        logClientList();
    });

});

//Broadcast message to all connected clients
function broadcastMessage(command, message) {
    for (var i = 0; i < clients.length; i++) {
        if (clients[i]) {
            clients[i].sendUTF(command + " " + message);
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

// Fetch JSON object from path
// Boolean local: is the json stored locally (true) or hosted externally (false)
// TODO: Should rename to "loadAndSendJSON"
function loadJSON(pathToJSON, local) {
    var jsonObj;
    // JSON file is stored locally
    if (local) {
        try {
            jsonObj = fs.readFileSync(pathToJSON);
            console.log("Loaded JSON: ");
            console.log(JSON.parse(jsonObj));
            console.log("------");

            // Send JSON to all clients
            broadcastMessage("accepted", jsonObj);
        } catch (err) {
            console.log("Error loading config file: " + err);
        }
    }
    // JSON file is hosted externally
    else {
        request({
            url: pathToJSON,
            json: true
        }, function(error, response, body) {

            if (!error && response.statusCode === 200) {
                jsonObj = JSON.stringify(body);
                console.log("Loaded JSON: ");
                console.log(JSON.parse(jsonObj));
                console.log("------");

                // Send JSON to all clients
                broadcastMessage("accepted", jsonObj);
            }
        });
    }
}

// Send all configs back-to-back to all connected clients
// TODO: This function has a terrible name. Rename to "sendAllConfigsToClients" or something like that.
function fetchConfigs() {
    fs.readdir(localPathToConfigs, function(err, files) {
        console.log("Found files in directory: ");
        console.log(files);
        var combinedJson = "";
        for (var i = 0; i < files.length; i++) {
            if (files[i].substr(files[i].lastIndexOf(".") + 1) == "json") {
                //Read every file
                try {
                    jsonObj = fs.readFileSync(localPathToConfigs + files[i]);
                    // TODO: This syntax doesn't sound nice
                    combinedJson += files[i] + ": " + jsonObj + "---";
                } catch (err) {
                    console.log("Error loading config file: " + err);
                }
            }
        }
        console.log("Combined all json files: ");
        console.log(combinedJson);
        broadcastMessage("combinedjson", combinedJson);
    });
}

// Update a config file
function updateConfig(incomingData) {
    var split = incomingData.split("{");
    var configName = split[0].substring(0, split[0].length - 1);
    var configBody = "{" + split[1];

    //Write to local json file
    fs.writeFile(localPathToConfigs + configName, configBody, function(err) {
        if (err) {
            return console.log(err);
        }
        // TODO: Let caller of updateConfig choose to call fetchConfigs himself
        fetchConfigs();
    });

}

// Delete a config file (actually delete the file)
function deleteConfig(incomingData) {
    fs.unlink(localPathToConfigs + incomingData, function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("Deleted " + incomingData);

        // TODO: Let caller of updateConfig choose to call fetchConfigs himself
        fetchConfigs();
    });
}


function readJsonFromPath(path, filename, callback) {
    var listing;
    fs.readdir(path, function(err, list) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < list.length; i++) {
                if (list[i] === filename) {
                    var file = fs.readFileSync(path + "/" + list[i]);
                    var json = JSON.parse(file);
                    listing = json;
                }
            }
        }
        return callback(listing);
    });
}

function readJsonInDirectory(filename) {
  try {
      var filename = pathing.resolve('./'+ filename);
      delete require.cache[filename];
      var json = require(filename);
      return json;
  } catch(err) {
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
                    listing.push(item);
                }
            }
        }
        return callback(listing);
    });
}

function storeAddressesInList() {
    console.log("Reading addresses from JSON");

    var json = readJsonInDirectory("config.json");
    var list = [];
    for (var i = 0; i < json.length; i++) {
        list.push(json[i].screenAddress);
    }
    console.dir(list);
    return list;
}

function makeJsonViewFile(jsonfile) {
    var obj = {
        "screenName": jsonfile.screenName,
        "views": allViews(jsonfile)
    };
    return obj;
}

function allViews(jsonfile) {
    var results = [];
    for (var i = 0; i < jsonfile.screenViews.length; i++) {
        var viewjson = readJsonInDirectory("modules/" + jsonfile.screenViews[i].screenParentModule + "/" + jsonfile.screenViews[i].viewName + "/info.json");
        if(viewjson === undefined) continue;
        var obj = {
            "viewName": jsonfile.screenViews[i].viewName,
            "parentModule": jsonfile.screenViews[i].screenParentModule,
            "managerUrl": viewjson.view_javascript_reference,
            "windows": allWindows(jsonfile.screenViews[i], jsonfile)
        };
        results.push(obj);
    }
    return results;
}

function allWindows(jsonSC, jsonfile) {
    var results = [];
    for (var i = 0; i < jsonSC.screenComponents.length; i++) {
        var windowjson = readJsonInDirectory("modules/" + jsonSC.screenComponents[i].viewWindow + "/info.json");
        var screenjson = undefined;

        for (var j = 0; j < jsonfile.screenWindows.length; j++) {
            if (jsonfile.screenWindows[j].windowIdentifier === jsonSC.screenComponents[i].dsWindow) {
                screenjson = jsonfile.screenWindows[j];
            }
        }
        var obj = {
            "name": windowjson.window_name,
            "type": screenjson.windowShape,
            "pixelWidth": screenjson.windowPixelWidth,
            "pixelHeight": screenjson.windowPixelHeight,
            "coordX": screenjson.windowCoordX,
            "coordY": screenjson.windowCoordY,
            "htmlUrl": windowjson.window_html_reference
        };
        results.push(obj);
    }
    return results;
}

//handles an upload of a new module
function handleModuleUpload(req, res){
  upload(req,res,function(err) {
       if(err) {
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

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './tmp');
  },
  filename: function (req, file, callback) {
    var name = file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    callback(null, name);
  }
});
var upload = multer({ storage : storage}).single('new-module');


//unzips a zip file to tmp folder.
function unzipFile(fileName, res){
  var fromPath = 'tmp/'+ fileName;

  //check to see if the file uploaded is a zip file.
  var splitFileName = fileName.split('.');
  if(splitFileName[splitFileName.length-1] != 'zip'){
    //the file uploaded is not a zip file.
    removeFile(fromPath);
    notifyUser(splitFileName[splitFileName.length-1] + ' type is not supported, only zip type files are currently supported(see documentation'
      +' for more information).', res);
    return;
  }
  //the file is a zip
  var dir = './tmp/' + fileName + 'folder';
  mkdirp(dir, function(err) {
    if(err){
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
function validateModule(pathToModule, res){
  console.log("validating module " + pathToModule );
  //reads the content of the folder
  fs.readdir(pathToModule, function(err, files){
    if(err){
      console.log(err);
      notifyUser("An error occured while uploading the file, please try again! Error-code: UP03", res);
      return;
    }
    //Checks to see if it is a valid module
    if(files.length != 1){
      console.log("Error invalid module structure: files are not in the same folder");
      removeDir(pathToModule);
      notifyUser("Error the structure of the module is not valid, the top level of the archive can only contain one folder (and no files)."
      +"See the documentation for more information.", res);
      return;
    }
    //check to see if the module already exists in the system
    fs.stat('modules/'+ files[0], function(err, stats){
      if(err){
        //succes module doesnt exist.
        fs.rename(pathToModule+'/'+files[0], 'modules/'+files[0], function(err){ //optionnaly change to name in info.json
          if(err){
            console.log(err);
            notifyUser("An error has occured while uploading your module. Error-code: UP04",res);

          } else {
            //module is added to the system
            notifyUser("The module: "+files[0]+ " is added to the system and ready for use.",res);
          }
          removeDir(pathToModule); //remove the leftover files from the tmp folder.

        })
        return;
      }

      console.log("module already exists!");
      removeDir(pathToModule);
      notifyUser("A module with this name already exists, consider re-naming this module or removing the existing module.",res);

    });
  });
}
//unzips a zip file to a given path.
function simpleUnzip(fromPath, toPath){
  var zip = new AdmZip(fromPath);
  zip.extractAllTo(toPath, true);
}
//removes a single file.
function removeFile(fromPath){
  fs.unlink(fromPath, function(err){
    if(err) console.log(err);
  })
}
//can be used to remove an empty dir.
function removeEmptyDir(path){
  fs.rmdir(path, function(err){
    if(err) console.log(err);
  });
}
//removes a dir with the content within this dir.
function removeDir(path){
  rmdir(path, function (err, dirs, files) {
  if(err){
    console.log(err);
  }
  console.log(dirs);
  console.log(files);
  console.log('all files are removed');
  });
}

//sends a respond to a user.
function notifyUser(message, res){
  res.end("<script>alert('"+ message+"'); window.location = '/';</script>");
}
