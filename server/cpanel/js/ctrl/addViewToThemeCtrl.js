dscms.app.controller('dscmsAddViewToThemeCtrl', function($scope, $modalInstance, dscmsWebSocket) {
  $scope.newView = {};

  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      case "windowinfo":

        break;
    }
  });

  $scope.addView = function() {
    $modalInstance.close($scope.newView);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});
