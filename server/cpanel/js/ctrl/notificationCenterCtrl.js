dscms.app.controller('dscmsNotificationCenterCtrl', function($scope, $element, dscmsNotificationCenter) {
  dscmsNotificationCenter.subscribe(function(shouldShow) {
    if (shouldShow) {
      $scope.title = dscmsNotificationCenter.currentNotification.title;
      $scope.text = dscmsNotificationCenter.currentNotification.text;
      $element.css('top', '0');
    } else {
      $element.css('top', '-20%');
    }
  });
});
