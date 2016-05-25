var dscms = {};
dscms.app = angular.module('dscmsDataskylineClientApp', ['ngRoute']);

/*
  Set the page title to "DataSkyline" to make sure a title is present
  The page title should be changed to something more specific once screen info is received from server.
*/
dscms.app.run(function($rootScope) {
    $rootScope.title = "DataSkyline";
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
  Keeps a connection to the DataSkyline websocket server and
  provides functions and callbacks for interacting with this server.
*/
dscms.app.factory('dscmsWebSocket', function() {
    var functions = {};
    // TODO: Provide methods for sending commands to WS
    // TODO: Implement stuff on server so we can do something here
    var callbackMethods = {};
    var callbackIterator = 0;
    // TODO: Reference to real server (configure skyline screens to have hostname "dscms" route to skyline IP?)
    var ws = new WebSocket("ws://localhost:8080", "echo-protocol");

    ws.onopen = function() {
      // TODO: Should we do something here?
      console.log("Connected to socket");
      ws.send("/test");
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

    return functions;
});
