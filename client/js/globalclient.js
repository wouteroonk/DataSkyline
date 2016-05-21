var app = angular.module('dataskylineClientApp', ['ngRoute']);

/*
  Set the page title to "DataSkyline" to make sure a title is present
  The page title should be changed to something more specific once screen info is received from server.
*/
app.run(function($rootScope) {
    $rootScope.title = "DataSkyline";
});

/*
  Show the correct page on screen. For now this can only be the Live Skyline.
  In the future we could add a debug view to this.
*/
app.config(function($routeProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'pages/liveskyline.html',
        controller: 'LiveSkylineCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });

});

/*
  Keeps a connection to the DataSkyline websocket server and
  provides functions and callbacks for interacting with this server.
*/
app.factory('DataSkylineWS', function() {
    var functions = {};
    // TODO: Connect to WS
    // TODO: Keep a list of callbacks to call on message received
    // TODO: "subscribe" and "unsubscribe" for callbacks
    // TODO: Provide methods for sending commands to WS
    return functions;
});
