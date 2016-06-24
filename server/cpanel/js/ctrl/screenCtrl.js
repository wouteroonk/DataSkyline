/**
  Created by Steyn Potze on 2016-06-07
  This controller is linked to the edit topic or "/screen/x" page and gets screen
  information from the server.
*/
dscms.app.controller('dscmsScreenCtrl', function($scope, $routeParams, $modal, $location, dscmsWebSocket, dscmsNotificationCenter) {
  $scope.pageClass = "dscms-page-screen";
  $scope.screenName = $routeParams.screen;
  $scope.screens = null;
  $scope.selectedScreenPos = null;
  $scope.selectedBackup = null;
  $scope.selectedWindowPos = null;

  // List of "empty" windows for the selected screen
  // This list is used as the config json for mini-skyline-screen.
  $scope.previewConfig = null;

  // =========================
  // WebSocket stuff
  // =========================

  // Subscribe to the WebSocket to listen for updates
  var subID = dscmsWebSocket.subscribe(function(message) {
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
      case "skylineupdate":
        skylineUpdateHandler(commands.shift());
        break;
    }
  });

  $scope.$on("$destroy", function() {
    dscmsWebSocket.unsubscribe(subID);
  });

  // Handle updates from the server
  function skylineUpdateHandler(type) {
    switch (type) {
      case 'updatescreen':
        dscmsNotificationCenter.info('', 'A screen was updated.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'removescreen':
        dscmsNotificationCenter.info('', 'A screen was removed.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;

      default:
        // We don't need to handle this
    }
  }

  dscmsWebSocket.sendServerMessage('getscreens');

  $scope.$watch('screens', function() {
    if ($scope.screens === null) return;
    $.each($scope.screens, function(i, screen) {
      if (screen.name === $scope.screenName) {
        $scope.selectedScreenPos = i;
        $scope.selectedBackup = JSON.parse(angular.toJson($scope.screens[$scope.selectedScreenPos]));
        if ($scope.screens[i].windows.length > 0) {
          $scope.selectedWindowPos = 0;
        }
        updatePreviewConfig();
        return;
      }
    });
    if ($scope.selectedScreenPos === null) {
      dscmsNotificationCenter.warning('Whoops!', 'The screen you are trying to edit does not exist anymore.');
      $location.path('/');
    }
  });

  $scope.changeSelectedWindowPos = function(i) {
    $scope.selectedWindowPos = i;
    updatePreviewConfig();
  };

  // Cancel topic edit (go back to home)
  $scope.cancelEdit = function() {
    // Warn the user when changes have not been saved
    if (angular.toJson($scope.screens[$scope.selectedScreenPos]) !== angular.toJson($scope.selectedBackup)) {
      swal({
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

  $scope.saveEdit = function() {
    dscmsWebSocket.sendServerMessage('updatescreen ' + angular.toJson($scope.screens[$scope.selectedScreenPos]));
    $scope.selectedBackup = JSON.parse(angular.toJson($scope.screens[$scope.selectedScreenPos]));
  };

  $scope.addWindow = function() {
    var modalInstance = $modal.open({
      templateUrl: 'cpanel/modals/addWindowToScreen.html',
      controller: 'dscmsAddWindowToScreenCtrl',
      resolve: {
        screens: function() {
          return $scope.screens;
        }
      }
    });

    // Modal will probably return view object. Add it to windowinfo and reload preview
    modalInstance.result.then(function(result) {
      // We need more info before we can do adding
      if (result === undefined) return;
      $scope.screens[$scope.selectedScreenPos].windows.push(result);
      if ($scope.screens[$scope.selectedScreenPos].windows.length === 1)
        $scope.selectedWindowPos = 0;

      updatePreviewConfig();
    });
  };

  $scope.removeWindow = function(index) {
    swal(
      {
        title: "Are you sure?",
        text: "This will delete \"Window " + $scope.screens[$scope.selectedScreenPos].windows[index].id + "\" forever.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Delete",
        closeOnConfirm: true
      }, function(isConfirm) {
        // Tell server to delete topic if confirmed
        if (isConfirm) {
          if ($scope.screens[$scope.selectedScreenPos].windows.length > 1) {
            $scope.selectedWindowPos = 0;
          } else {
            $scope.selectedWindowPos = null;
          }
          $scope.screens[$scope.selectedScreenPos].windows.splice(index, 1);
          updatePreviewConfig();
          $scope.$apply();
        }
      });
  };

  $scope.updatePreview = function() {
    updatePreviewConfig();
  };

  // Converts screen info to dscms-mini-screen format and asks server for windowinfo
  function updatePreviewConfig() {
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
      miniWindow.onClick = function(e, id) {
        $.each($scope.screens[$scope.selectedScreenPos].windows, function(j, w) {
          if (w.id === id) $scope.changeSelectedWindowPos(j);
          $scope.$apply();
        });
      };

      // Set the hue for an empty window

      if (i === $scope.selectedWindowPos) miniWindow.type = "selected";
      else miniWindow.type = "empty";

      // TODO: We need preview images (server side)

      // Add the created window to the miniscreen configuration object
      miniScreenConf.windows.push(miniWindow);
    }
    $scope.previewConfig = miniScreenConf;
  }
});
