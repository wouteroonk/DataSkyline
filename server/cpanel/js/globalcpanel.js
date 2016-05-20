var app = angular.module('dataskylineControlApp', ['ngRoute', 'ui.bootstrap']);

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
