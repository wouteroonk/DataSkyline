/**
  Created by Steyn Potze on 2016-06-23
  An instance of this controller is always coupled to an "add window to screen" modal.
  As the name says, this controller contains functionallity for a adding a window to a screen.
*/
dscms.app.controller('dscmsAddWindowToScreenCtrl', function($scope, $modalInstance, dscmsWebSocket, dscmsNotificationCenter, screens) {
  $scope.newWindow = {
    id: "",
    shape: "",
    width: "",
    height: "",
    x: "",
    y: ""
  };

  $scope.addWindow = function() {
    if (
      $scope.newWindow.id === undefined || $scope.newWindow.id === null || $scope.newWindow.id.trim().length === 0 ||
      $scope.newWindow.shape === undefined || $scope.newWindow.shape === null || $scope.newWindow.shape.trim().length === 0 ||
      $scope.newWindow.width === undefined || $scope.newWindow.width === null || $scope.newWindow.width.trim().length === 0 ||
      $scope.newWindow.height === undefined || $scope.newWindow.height === null || $scope.newWindow.height.trim().length === 0 ||
      $scope.newWindow.x === undefined || $scope.newWindow.x === null || $scope.newWindow.x.trim().length === 0 ||
      $scope.newWindow.y === undefined || $scope.newWindow.y === null || $scope.newWindow.y.trim().length === 0
    ) {
      dscmsNotificationCenter.warning('Oops!', 'You forgot to fill in one or more fields.', 2000);
      return;
    }

    var plsDontAdd = false;
    $.each(screens, function(i, screen) {
      $.each(screen.windows, function(i, window) {
        if (window.id === $scope.newWindow.id) {
          plsDontAdd = true;
        }
      });
    });
    if (plsDontAdd) {
      dscmsNotificationCenter.warning("Sorry!", "This window ID is taken.");
      return;
    }
    $modalInstance.close($scope.newWindow);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});
