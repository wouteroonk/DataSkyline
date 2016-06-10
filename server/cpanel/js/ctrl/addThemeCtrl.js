dscms.app.controller('dscmsAddThemeCtrl', function($scope, $modalInstance, dscmsWebSocket, themes) {
  $scope.newThemeName = "";
  $scope.newThemeDescription = "";


  $scope.addTheme = function(name, description) {
    $scope.showThemeError = false;
    //console.log($scope.newThemeName + " " + $scope.newThemeDescription);
    if (name === undefined || name.trim().length === 0) {
      $scope.addThemeError = "Your theme needs a name.";
      $scope.showThemeError = true;
      return;
    }
    if (description === undefined || description.trim().length === 0) {
      $scope.addThemeError = "Your theme needs a description.";
      $scope.showThemeError = true;
      return;
    }
    var exists = false;
    themes.forEach(function(currentValue, index, arr) {
      if (currentValue.name == name) {
        $scope.addThemeError = "It seems like a theme with this name already exists.";
        $scope.showThemeError = true;
        exists = true;
        return;
      }
    });
    if (exists) return;
    dscmsWebSocket.sendServerMessage("addtheme " + name + " " + description);
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.nameKeydown = function(e) {
    if (e.keyCode == 32) {
      $scope.newThemeName += "-"; // append '-' to input
      e.preventDefault();
    }
  };

});
