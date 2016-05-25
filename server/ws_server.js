#!/usr/bin/env node
// Global variables

// Require other nodes
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require("fs"); //Access local filesystem
var request = require("request"); //To make an http GET request to external json file

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

  // Serve control panel when root is accessed
  if (request.url === '/') {
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
    fs.readFile('./' + request.url, function(err, data) {
      if (!err) {
        // Get file extension
        var dotoffset = request.url.lastIndexOf('.');
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
        }[request.url.substr(dotoffset)];
        // Set the content type and write the file
        response.setHeader('Content-type', mimetype);
        response.end(data);

        console.log(request.url, mimetype);
      } else {
        // File does not exist
        console.log('file not found: ' + request.url);
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
    for(var i = 0; i < data.length; i++) {
      if (data[i] === 'requestwindows') {
        ip = data[i + 1];
      }
    }
    console.log("IP: " + ip);
    var json = readJsonInDirectory("config.json");
    console.dir(json);
    switch(ip) {
      case "192.168.1.100":
        console.log("Address found!");
        connection.send("windowinfo "+JSON.stringify(json));
            break;
      case "192.168.1.101":
        console.log("Address found!");
        connection.send("windowinfo "+JSON.stringify(json));
            break;
      case "192.168.1.102":
        console.log("Address found!");
        connection.send("windowinfo "+JSON.stringify(json));
            break;
      case "192.168.1.103":
        console.log("Address found!");
        connection.send("windowinfo "+JSON.stringify(json));
            break;
      case "145.136.77.66":

          console.log("Address found!");
          connection.send("windowinfo "+JSON.stringify(json));
            break;
      default:
            console.log("Error: Unknown IP address");
            connection.sendUTF("Error: received unknown IP address");
            break;
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


function readJsonFromPath(path,filename, callback) {
  var listing;
  fs.readdir(path,function(err,list) {
    if(err) {
      console.log(err);
    } else {
      for(var i = 0 ; i < list.length; i++) {
        if(list[i] === filename){
          var file = fs.readFileSync(path+"/"+list[i]);
          var json = JSON.parse(file);
          listing = json;
        }
      }
    }
    return callback(listing);
  });
}

function readJsonInDirectory(filename) {
  var json = require("./"+filename);
  return json;
}

function readDirectories(path, callback) {
  var listing = [];
  fs.readdir(path,function(err,list) {
    if(err) {
      console.log(err);
    } else {
      for(var i = 0 ; i < list.length; i++) {
        var item = list[i];
        if(fs.lstatSync(path+"/"+item).isDirectory()){
          listing.push(item);
        }
      }
    }
    return callback(listing);
  });
}