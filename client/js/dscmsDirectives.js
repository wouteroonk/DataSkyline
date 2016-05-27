// This directive instantiates a DSCMS view
dscms.app.directive('dscmsView', function() {
  return {
    restrict: 'E',
    scope: {
      dscmsDataObject : '=',
      dscmsViewId : '='
    },
    templateUrl: 'partials/dscmsView.html',
    controller: 'dscmsViewCtrl'
  };
});
