var dscms = {};
dscms.app = angular.module('dscmsDataskylineControlApp', ['ngRoute', 'ui.bootstrap']);

/*
  Set the page title to "DataSkyline control panel" to make sure a title is present
  The page title should be changed to something more specific once a page is loaded.
*/
dscms.app.run(function($rootScope) {
    $rootScope.title = "DataSkyline control panel";
});

/*
  Show the correct page on screen.
*/
dscms.app.config(function($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'cpanel/pages/home.html',
    controller: 'dscmsHomeCtrl'
  }).
  when('/screens', {
    templateUrl: 'cpanel/pages/screens.html',
    controller: 'dscmsScreensCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });

});

dscms.app.controller('dscmsNavigationCtrl', function($scope, $location) {
  $scope.isActive = function(page) {
    return page === $location.path();
  };
});


/*
  Keeps a connection to the DataSkyline websocket server and
  provides functions and callbacks for interacting with this server.
*/
dscms.app.factory('dscmsWebSocket', function($location) {
  var functions = {};
  // TODO: Provide methods for sending commands to WS
  // TODO: Implement stuff on server so we can do something here
  var callbackMethods = {};
  var callbackIterator = 0;

  // TODO: Reference to real server (configure skyline screens to have hostname "dscms" route to skyline IP?)
  var ws = new WebSocket("ws://localhost:8080", "echo-protocol");

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

      }, 5); // wait 5 milisecond for the connection...
  };

  ws.onopen = function() {
    // TODO: Should we do something here?
    console.log("Connected to socket");
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

  // Ask the server to send window info for IP
  functions.requestWindowsForIP = function(ip) {
    waitForWS(function() {
      ws.send("requestwindows " + ip);
    });
  };

  functions.sendServerMessage = function(stringMessage) {
    waitForWS(function() {
      ws.send(stringMessage);
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
      var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      pc.onicecandidate = noop;
      callback(myIP);
    };
  };

  return functions;
});
