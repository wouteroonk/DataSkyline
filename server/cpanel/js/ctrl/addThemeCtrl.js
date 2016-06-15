/**
  Created by Hugo van der Geest and Steyn Potze on ???
  An instance of this controller is always coupled to an "add theme" modal.
  As the name says, this controller contains functionallity for adding a theme
  to the Dataskyline.
*/
dscms.app.controller('dscmsAddThemeCtrl', function($scope, $modalInstance, dscmsWebSocket, themes) {
  $scope.newThemeName = "";
  $scope.newThemeDescription = "";

  // Executed from ng-click on "Add theme" button
  $scope.addTheme = function(name, description) {
    $scope.showThemeError = false;

    // Check if a name has been entered
    if (name === undefined || name.trim().length === 0) {
      $scope.addThemeError = "Your theme needs a name.";
      $scope.showThemeError = true;
      return;
    }

    // Check if a description has been entered
    if (description === undefined || description.trim().length === 0) {
      $scope.addThemeError = "Your theme needs a description.";
      $scope.showThemeError = true;
      return;
    }

    // Check if the theme already exists
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

    // Tell the server to add the theme
    dscmsWebSocket.sendServerMessage("addtheme " + name + " " + description);

    $modalInstance.close();
  };

  // Executed from ng-click on "Cancel" and "Close modal" buttons
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  // Prevent user from entering space character (replace space with "-")
  $scope.nameKeydown = function(e) {
    if (e.keyCode == 32) {
      var maxLength = document.getElementById("newThemeNameInput").maxLength;
      if($scope.newThemeName.length < maxLength){
        $scope.newThemeName += "-"; // append '-' to input
      }
      e.preventDefault();
    }
  };

});
