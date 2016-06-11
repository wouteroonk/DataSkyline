/**
    Created by Steyn Potze on 2016-06-03
    Last updated by Steyn Potze on 2016-06-10 (Added ngEnter)
    This file houses all Angular directives for the cpanel
**/

// This directive renders a Dataskyline screen based on its IP
dscms.app.directive('miniSkylineScreen', function() {
  return {
    restrict: 'E',
    scope: {
      windows: '='
    },
    templateUrl: 'cpanel/partials/miniSkylineScreen.html',
    controller: 'dscmsMiniSkylineScreenCtrl'
  };
});

// This directive executes some code specified in its attribute if the
// enter key is pressed when the element ng-enter has been applied to is in focus.
dscms.app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
