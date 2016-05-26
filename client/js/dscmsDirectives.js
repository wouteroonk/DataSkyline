// This directive instantiates a DSCMS view
dscms.app.directive('dscmsView', function() {
  return {
    restrict: 'E',
    scope: {
      dscmsDataObject : '='
    },
    templateUrl: 'partials/dscmsView.html',
    controller: 'dscmsViewCtrl'
  };
});
