dscms.app.controller('dscmsViewCtrl', function($scope, $attrs, $http) {
  // <dscms-view dscms-view-name="" dscms-view-manager-src="http://example.com/com.company.module/view/manager.js"></dscms-view>
  console.log($scope.dscmsDataObject);
  $http({
    method: 'GET',
    url: dscmsViewManagerSrc
  }).then(function success(response) {
    // TODO: process response data
    // TODO: init view
  }, function error(response) {
    // Shit
    console.log("Unable to load view with name: " + dscmsViewName);
  });

  function dscmsStartView(dscmsJsToEval) {
    // TODO: Add windows to screen
    eval(dscmsJsToEval);
  }
});
