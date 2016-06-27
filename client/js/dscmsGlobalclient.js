var dscms = {};
dscms.app = angular.module('dscmsDataskylineClientApp', ['ngRoute']);

/*
  Set the page title to "Dataskyline" to make sure a title is present
  The page title should be changed to something more specific once screen info is received from server.
*/
dscms.app.run(function($rootScope) {
  $rootScope.title = "Dataskyline";
});

/*
  Show the correct page on screen. For now this can only be the Live Skyline.
  In the future we could add a debug view to this.
*/
dscms.app.config(function($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'pages/liveskyline.html',
    controller: 'dscmsLiveSkylineCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });

});

/*
  Keeps a connection to the Dataskyline websocket server and
  provides functions and callbacks for interacting with this server.
*/
dscms.app.factory('dscmsWebSocket', function($location, dscmsTools) {
  var functions = {};
  // TODO: Provide methods for sending commands to WS
  // TODO: Implement stuff on server so we can do something here
  var callbackMethods = {};
  var callbackIterator = 0;

  // TODO: Reference to real server (configure skyline screens to have hostname "dscms" route to skyline IP?)
  var ws = new WebSocket("ws://" + dscmsTools.serverAddress + ":8080", "echo-protocol");
  var hasConnection = false;
  var hasDisconnected = false;

  // This function runs the callback method when a connection with the WS has been made.
  var waitForWS = function(callback) {
    setTimeout(
      function() {
        if (ws.readyState === 1) {
          if (callback !== null) {
            callback();
          }
          return;

        } else {
          console.log("waiting for connection...");
          waitForWS(callback);
        }

      }, 5);
  };

  ws.onopen = function() {
    hasConnection = true;
    console.log("Connected to socket");
  };

  ws.onclose = function() {
    hasConnection = false;
    hasDisconnected = true;
    console.log("Disconnected from socket");
  };

  ws.onmessage = function(message) {
    // Execute all callback methods and pass message to them
    // TODO: Pre-processing?
    for (var i in callbackMethods) {
      callbackMethods[i](message);
    }
  };

  functions.subscribe = function(callback) {
    // Add callback to list and add one to iterator.
    // This way we can safely use callbackIterator as a UID.
    callbackMethods[callbackIterator] = callback;
    callbackIterator++;
    return callbackIterator - 1;
  };

  functions.unsubscribe = function(uid) {
    // Delete callback with uid from list if it exists
    if (callbackMethods.hasOwnProperty(uid)) {
      delete callbackMethods[uid];
      return true;
    }
    return false;
  };

  functions.shouldReloadOnWindowInfo = true;

  functions.sendServerMessage = function(stringMessage) {
    waitForWS(function() {
      ws.send(stringMessage);
    });
  };

  // Ask the server to send window info for IP
  functions.requestWindowsForIP = function(ip) {
    waitForWS(function() {
      ws.send("requestwindows " + ip);
    });
  };

  functions.setTopic = function(topic) {
    waitForWS(function() {
      ws.send("settopic " + topic);
    });
  };

  functions.getTopics = function(){
    waitForWS(function(){
      ws.send("gettopics");
    });
  };

  // Damn, this is way too hacky
  // A function that gets the local IP and has to do this using a callback method.
  // That doesn't even sound right
  functions.requestOwnLocalIP = function(callback) {
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({
        iceServers: []
      }),
      noop = function() {};
    pc.createDataChannel(""); //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
    pc.onicecandidate = function(ice) { //listen for candidate events
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;

      var regexResult = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate);
      if (regexResult !== null) {
        pc.onicecandidate = noop;
        callback(regexResult[1]);
      }
    };
  };

  return functions;
});

// Tools for application wide variables, currently only server IP/Url
dscms.app.factory('dscmsTools', function() {
  var vars = {};

  vars.serverAddress = '192.168.1.100';
  vars.serverUrl = 'http://' + vars.serverAddress + ':8080';

  return vars;
});
