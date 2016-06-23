/**
  Created by Steyn Potze on 2016-06-07
  This controller is linked to the edit topic or "/screen/x" page and gets screen
  information from the server.
*/
dscms.app.controller('dscmsScreenCtrl', function($scope, $routeParams, $location, dscmsWebSocket, dscmsNotificationCenter) {
  $scope.pageClass = "dscms-page-screen";
  $scope.screenName = $routeParams.screen;
  $scope.screens = [];
  $scope.selectedScreenPos = null;
  $scope.selectedBackup = null;

  // List of "empty" windows for the selected screen
  // This list is used as the config json for mini-skyline-screen.
  $scope.previewConfig = null;

  // =========================
  // WebSocket stuff
  // =========================

  // Subscribe to the WebSocket to listen for updates
  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      // Getscreens message for getting the screen to edit
      case "getscreens":
        // Parse JSON
        var returnedScreenJSON;
        try {
          returnedScreenJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in getscreens message: " + message.data);
          console.dir(message);
          return;
        }
        // Fill the list of screens
        $scope.screens = returnedScreenJSON;
        $scope.$apply();
        break;
    }
  });

  dscmsWebSocket.sendServerMessage('getscreens');

  $scope.$watch('screens', function() {
    console.log('screens updated');
    $.each($scope.screens, function(i, screen) {
      if (screen.name === $scope.screenName) {
        $scope.selectedScreenPos = i;
        $scope.selectedBackup = $scope.screens[$scope.selectedScreenPos];
        updatePreviewConfig();
        return;
      }
    });
  });

  // Cancel topic edit (go back to home)
  $scope.cancelEdit = function() {
    // Warn the user when changes have not been saved
    if (angular.toJson($scope.screens[$scope.selectedScreenPos]) !== angular.toJson($scope.selectedBackup)) {
      swal(
        {
          title: "Are you sure?",
          text: "You have unsaved changes. Canceling will discard them.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Cancel anyway",
          closeOnConfirm: true
        }, function(isConfirm) {
          // If the user still wants to go to home page, do it
          if (isConfirm) {
            $location.path('/');
            $scope.$apply();
          }
        });
    } else {
      // When there are no changes, just go to home
      $location.path('/');
    }
  };

  // Converts screen info to dscms-mini-screen format and asks server for windowinfo
  function updatePreviewConfig(){
    // Fail-safe
    if ($scope.selectedScreenPos === null) return;

    // Load empty windows
    var miniScreenConf = {};
    miniScreenConf.screenWidth = $scope.screens[$scope.selectedScreenPos].width;
    miniScreenConf.screenHeight = $scope.screens[$scope.selectedScreenPos].height;
    miniScreenConf.windows = [];
    // Transfer data from screen windows to mini windows format
    for (var i = 0; i < $scope.screens[$scope.selectedScreenPos].windows.length; i++) {
      var dscmsWindow = $scope.screens[$scope.selectedScreenPos].windows[i];
      var miniWindow = {};
      miniWindow.id = dscmsWindow.id;
      miniWindow.pixelWidth = dscmsWindow.width;
      miniWindow.pixelHeight = dscmsWindow.height;
      miniWindow.coordX = dscmsWindow.x;
      miniWindow.coordY = dscmsWindow.y;
      miniWindow.shape = dscmsWindow.shape;
      miniWindow.hint = "Window " + dscmsWindow.id;

      // Set the hue for an empty window
      miniWindow.type = "empty";
      // TODO: We need preview images (server side)

      // Add the created window to the miniscreen configuration object
      miniScreenConf.windows.push(miniWindow);
    }
    $scope.previewConfig = miniScreenConf;
  }
});
