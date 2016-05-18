#!/usr/bin/env node
//Global variables
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require("fs"); //Access local filesystem
var request = require("request"); //To make an http GET request to external json file
var clients = [ ]; // list of currently connected clients (users)
var localPathToConfigs = "C:/Users/Gebruiker/Desktop/DataSkyline/server/"; //Where we store our local config json files
var globalIndex = 0;
var maxConnections = 7; //Max amount of connected clients allowed

//Construct websocket server
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    
    if (request.url === '/') { //Serve cpanel when accessing root
        fs.readFile('cpanel/cpanel.html', 'utf8', function(err, data) {
            if (err) {
                response.writeHead(404);
                response.end();
            }
            else {
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.end(data);
            }
        });
    }
    else {
    fs.readFile('./' + request.url, function(err, data) {
        if (!err) {
            var dotoffset = request.url.lastIndexOf('.');
            var mimetype = dotoffset == -1
                            ? 'text/plain'
                            : {
                                '.html' : 'text/html',
                                '.ico' : 'image/x-icon',
                                '.jpg' : 'image/jpeg',
                                '.png' : 'image/png',
                                '.gif' : 'image/gif',
                                '.css' : 'text/css',
                                '.js' : 'text/javascript'
                                }[ request.url.substr(dotoffset) ];
            response.setHeader('Content-type' , mimetype);
            response.end(data);
            console.log( request.url, mimetype );
        } else {
            console.log ('file not found: ' + request.url);
            response.writeHead(404, "Not Found");
            response.end();
        }
    });
    }
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

//Function to check if connection will be accepted/rejected
function originIsAllowed(origin) {
    var allowed = true;
    var checked = false;

    //Loop through clients list and insert connection at next free index
    //Reject connection if max connections is reached
    while(clients[globalIndex]){
        if(globalIndex >= maxConnections-1){
            if(checked){
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

    if (!originIsAllowed(request.origin)) { // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log('Connection from origin ' + request.remoteAddress + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    var index = globalIndex; //Assign index to new connection
    clients[index] = connection; //Add to client list

    console.log((new Date()) +  ' - Connection accepted from ' + connection.remoteAddress + " with index " + index); 
    logClientList();

    //When a message is received
    connection.on('message', function(message) {

        if (message.type === 'utf8') {
            console.log((new Date()) + ' - Received Message: ' + message.utf8Data);

            //If '/change' command is received
            if(message.utf8Data.substring(0, 8) == "/change "){
                //configName contains everything after the '/change' (should be configname.json)
                var configName = message.utf8Data.substring(8, message.utf8Data.Length);

                //Load json config & broadcast message when loaded
                loadJSON(localPathToConfigs + configName,true); //Load local config file

            } else if(message.utf8Data.substring(0, 11) == "/getconfigs"){ //Show all existing configs
                fetchConfigs();
            } else if (message.utf8Data.substring(0, 14) == "/updateconfig "){ //Update config files
                //incomingData contains everything after the '/updateconfig ' (should be config name & body)
                var incomingData = message.utf8Data.substring(14, message.utf8Data.Length);
                updateConfig(incomingData);
            } else if (message.utf8Data.substring(0, 14) == "/deleteconfig "){ //Update config files
                var incomingData = message.utf8Data.substring(14, message.utf8Data.Length);
                deleteConfig(incomingData);
            } else {//Else reject input
                console.log("Error: Unknown command: " + message.utf8Data); //Log in server
                connection.sendUTF("Error: Unknown command: " + message.utf8Data); //Send to client
            }
        }

        //We receive data type we shouldnt receieve..
        else if (message.type === 'binary') {
            console.log("Error: received binary data of " + message.binaryData.length +  " bytes");
            connection.sendUTF("Error: received binary data");
        } else {
            console.log("Error: received unknown data type");
            connection.sendUTF("Error: received unknown data type");
        }

    });

    //Client disconnects
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' - Peer ' + connection.remoteAddress + ' disconnected with index: ' + index);
        clients[index] = null;
        logClientList();
    });

});

//Broadcast message to all connected clients
function broadcastMessage(command,message){  
    for (var i=0; i < clients.length; i++) {
        if(clients[i]){
            clients[i].sendUTF(command + " " + message);
        }
    }
}

//Iterate over & log all connected clients
function logClientList(){
    console.log("Current connected clients: ");
    console.log("index : address")
    for (var i=0; i < clients.length; i++) {
        if(clients[i]){
            console.log( i + "     : " + clients[i].remoteAddress);
            //Note: remoteAddresses might start with "::ffff:"
            //This is an ipv4 address expressed through ipv6
        }
    }
    console.log("------");
}

//Fetch JSON object from path
//Boolean local: is the json stored locally (true) or hosted externally (false)
function loadJSON(pathToJSON, local){
    var jsonObj;
    if(local){ //config file is stored locally
        try {
            jsonObj = fs.readFileSync(pathToJSON);
            console.log("Loaded JSON: ");
            console.log(JSON.parse(jsonObj));
            console.log("------");
            broadcastMessage("accepted",jsonObj); //Send message when loaded
        }
        catch(err) {
            console.log("Error loading config file: " + err);
        }
    } else { //config file is hosted externally
        request({
            url: pathToJSON,
            json: true
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                jsonObj = JSON.stringify(body);
                console.log("Loaded JSON: ");
                console.log(JSON.parse(jsonObj));
                console.log("------");
                broadcastMessage("accepted",jsonObj); //Send message when loaded
            }
        })
    }
}

function fetchConfigs(){
    fs.readdir(localPathToConfigs, function(err,files){
        console.log("Found files in directory: ");
        console.log(files);
        var combinedJson = "";
        for (var i = 0; i < files.length; i++) {
            if(files[i].substr(files[i].lastIndexOf(".")+1) == "json"){
                //Read every file
                 try {
                    jsonObj = fs.readFileSync(localPathToConfigs + files[i]);
                    combinedJson += files[i] + ": " + jsonObj + "---" ;
                }
                catch(err) {
                    console.log("Error loading config file: " + err);
                }
            }
        }
        console.log("Combined all json files: ");
        console.log(combinedJson);
        broadcastMessage("combinedjson",combinedJson);
    });
}

function updateConfig(incomingData){
    var split = incomingData.split("{");
    var configName = split[0].substring(0, split[0].length - 1);;
    var configBody = "{" + split[1];

    //Write to local json file
    fs.writeFile(localPathToConfigs + configName, configBody, function(err) {
        if(err) {
            return console.log(err);
        }
        fetchConfigs();  //Fetch new configs & send to clients
    });
    
}

function deleteConfig(incomingData){
    fs.unlink(localPathToConfigs + incomingData, function(err) {
       if (err) {
           return console.error(err);
       }
       console.log("Deleted " + incomingData);
       fetchConfigs();  //Fetch new configs & send to clients
    });
}