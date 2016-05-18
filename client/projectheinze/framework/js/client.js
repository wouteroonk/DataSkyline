var currentScreen; //Stores current screen type (left/right/mid/led)
var socket; //Connection
var socketURL = "ws://192.168.1.100:8080"; //URL to websocket server

window.onload = function() {
    findIP(getScreen); //Call getIP first to identify screen type
}

// Start init when retrieved screen type
function init(){
    console.log("Current screen: " + currentScreen);
    setTimeout(function(){connectToWS()},100); //Connect on startup after small delay    
}

function loadConfig(configName){
    console.log("Loading "+ configName + ".json");
    socket.send("/change " + configName + ".json");
}

function connectToWS(){
    socket = new WebSocket(socketURL, "echo-protocol");

    //On connection open
    socket.addEventListener("open", function(event) {
        console.log("Connected to server " + socketURL);
    });

    // Display messages received from the server
    socket.addEventListener("message", function(event) {
        console.log("Server response: " + event.data);
      
        if (event.data.substring(0,9) == "accepted "){ //Server calls for update
            var incomingJSON = event.data.substring(9,event.data.Length);

            if(incomingJSON.substring(0,5) == "Error"){ //Something went wrong
                console.warn(incomingJSON);
            } else{
                var jsonContent = JSON.parse(incomingJSON);

                var newURL;
                switch(currentScreen) {
                case "left":
                    newURL = jsonContent.leftscreen;
                    break;
                case "right":
                    newURL = jsonContent.rightscreen;
                    break;
                case "mid":
                    newURL = jsonContent.midscreen;
                    break;
                case "led":
                    newURL = jsonContent.ledscreen;
                    break;
                case "touch": /* Do not change url for touchscreen */
                    break;
                default:
                    console.warn("Error: Unknown screen type: " + currentScreen);
                    break;
                }

                if(newURL){
                    if(newURL.substring(0,4) == "www."){ //If the url starts with "www." add "http://" for correct url handling
                        newURL = "http:\/\/" + newURL;
                    } //Else we assume it's a local url, do nothing
                    
                    //Close connection first, load URL after short delay
                    socket.close();
                    setTimeout(function(){window.location = newURL},100);
                }
            }

        } else if (event.data.substring(0,13) == "combinedjson "){ //Server sends all existing json files
            if(typeof(showConfigs) == "function"){ //Only if showConfigs is defined, meaning only if generate.js is included
                var incomingJSON = event.data.substring(13,event.data.Length);
                showConfigs(incomingJSON);  
            }
        }

    });

    // Display any errors that occur
    socket.addEventListener("error", function(event) {
        console.warn("Error: " + event);
    });

    //On connection close
    socket.addEventListener("close", function(event) {
        console.warn("Disconnected from server");
        console.warn("Reconnecting in 5 seconds...");
        setTimeout(function(){location.reload()},600000); //Try to connect again
    });

}