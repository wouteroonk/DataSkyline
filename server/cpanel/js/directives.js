/**
    Created by Steyn Potze on 2016-06-03
    Last updated by Steyn Potze on 2016-06-03 (Added miniSkylineScreen)
    This file houses all Angular directives for the cpanel
**/

// This directive renders a Dataskyline screen based on its IP
dscms.app.directive('miniSkylineScreen', function() {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'cpanel/partials/miniSkylineScreen.html',
    controller: 'dscmsMiniSkylineScreenCtrl'
  };
});
