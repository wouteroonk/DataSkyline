var app = angular.module('dataskylineControlApp', ['ngRoute', 'ui.bootstrap']);

/*
  Set the page title to "DataSkyline control panel" to make sure a title is present
  The page title should be changed to something more specific once a page is loaded.
*/
app.run(function($rootScope) {
    $rootScope.title = "DataSkyline control panel";
});

/*
  Show the correct page on screen.
*/
app.config(function($routeProvider) {
  $routeProvider.
  when('/modules', {
    templateUrl: 'cpanel/pages/modules.html',
    controller: 'ModulesCtrl'
  }).
  when('/screens', {
    templateUrl: 'cpanel/pages/screens.html',
    controller: 'ScreensCtrl'
  }).
  otherwise({
    redirectTo: '/modules'
  });

});

app.controller('NavigationCtrl', function($scope, $location) {
  $scope.isActive = function(page) {
    return page === $location.path();
  };
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
