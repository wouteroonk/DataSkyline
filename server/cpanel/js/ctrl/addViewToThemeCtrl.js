/**
  Created by Steyn Potze on 2016-06-10
  An instance of this controller is always coupled to an "add view to theme" modal.
  As the name says, this controller contains functionallity for a view instance  to a theme.
  It also subscribes to the websocket connection to get a list of modules and their views.
*/
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
