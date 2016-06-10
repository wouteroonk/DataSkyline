dscms.app.controller('dscmsThemeCtrl', function($scope, $routeParams, $location, dscmsWebSocket, dscmsNotificationCenter) {
  $scope.themeName = $routeParams.theme;

  // A screen is a physical screen, or client
  $scope.selectedScreenPos = null;
  $scope.tempScreenSelect = null;
  $scope.screens = [];

  // Windowinfo message
  $scope.thisScreenWinInf = null;
  $scope.thisScreenWinInfBackup = null;

  // List of "empty" windows for the selected screen
  $scope.previewConfig = null;

  // Selected view is the view instance that has been selected using the dropdown
  $scope.selectedViewPos = null;

  // The ID of the window that should be changed (by clicking in the preview)
  $scope.windowIdToReplace = null;

  // =========================
  // WebSocket stuff
  // =========================

  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      // Windowinfo message for getting the views that are associated with the selected screen
      case "windowinfo":
        var returnedWindowJSON;
        try {
          returnedWindowJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in windowinfo message: " + message.data);
          console.dir(message);
          return;
        }
        addWindowsToPreview(returnedWindowJSON);
        break;
      // Getscreens message for getting the screens and their description
      case "getscreens":
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
        // Select the first screen if any
        if ($scope.screens.length > 0) $scope.selectedScreenPos = 0;
        $scope.$apply();
        break;
    }
  });

  // =========================
  // Method calls
  // =========================

  // Request screen data
  dscmsWebSocket.sendServerMessage("getscreens");

  // =========================
  // Watchers
  // =========================

  // Add specific info related to selected view to preview when view is selected
  $scope.$watch('selectedViewPos', showSelectedViewInPreview);

  // Change the selected screen position (in screens list) based on screen object
  $scope.$watch('tempScreenSelect', function() {
    if ($scope.tempScreenSelect === null) return;

    $scope.screens.forEach(function(obj, i) {
      if (obj.screenName === $scope.tempScreenSelect.screenName) {
        $scope.selectedScreenPos = i;
        return;
      }
    });
  });

  // When another screen has been selected, refresh the preview and ask for windowinfo
  $scope.$watch('selectedScreenPos', updatePreviewConfig, true);

  // =========================
  // Functions with direct influence on shown data
  // =========================

  // Reset the colors of the preview windows
  // Free windows are green, taken windows are orange.
  function resetColors() {
    var allViewWindows = [];
    // Make a list of all filled windows
    for (var i = 0; i < $scope.thisScreenWinInf.views.length; i++)
      allViewWindows = allViewWindows.concat($scope.thisScreenWinInf.views[i].windows);

    // Keep a list of windows that are orange to prevent override
    var alreadyOrange = [];
    // Loop through filled windows and color them
    for (var j = 0; j < allViewWindows.length; j++) {
      var thisWindow = allViewWindows[j];
      // Grab the associated bare window and color it
      $.grep($scope.previewConfig.windows, function(e){
        // We shouldn't do anything if this window is already orange
        if (alreadyOrange.indexOf(e.id) !== -1) return;
        if (e.id == thisWindow.dsWindow) {
          alreadyOrange.push(e.id);
          e.hue = "#E8B075";
        } else {
          // To reset previously colored windows, make a non-match green again
          e.hue = "#3DCD95";
        }
      });
    }
  }

  // Fill windows with views based on windowinfo message
  function addWindowsToPreview(windowinfo) {
    // Ahh, copying objects...
    $scope.thisScreenWinInf = JSON.parse(angular.toJson(windowinfo));
    $scope.thisScreenWinInfBackup = JSON.parse(angular.toJson(windowinfo));

    if ($scope.thisScreenWinInf.views.length > 0) $scope.selectedViewPos = 0;
    showSelectedViewInPreview();
    $scope.$apply();
  }

  // Show specific info related to the selected screen on the preview
  // Changes colors of windows used by selected view to blue
  function showSelectedViewInPreview() {
    if ($scope.selectedViewPos === null || $scope.thisScreenWinInf === null) return;
    resetColors();
    if ($scope.thisScreenWinInf.views.length === 0) return;
    for (var j = 0; j < $scope.thisScreenWinInf.views[$scope.selectedViewPos].windows.length; j++) {
      var thisWindow = $scope.thisScreenWinInf.views[$scope.selectedViewPos].windows[j];
      $.grep($scope.previewConfig.windows, function(e){
        if (e.id == thisWindow.dsWindow)
          e.hue = "#3149E2";
      });
    }
  }

  // Converts screen info to dscms-mini-screen format and asks server for windowinfo
  function updatePreviewConfig(){
    // Fail-safe
    if ($scope.selectedScreenPos === null) return;

    // Load empty windows
    var miniScreenConf = {};
    miniScreenConf.screenWidth = $scope.screens[$scope.selectedScreenPos].screenWidth;
    miniScreenConf.screenHeight = $scope.screens[$scope.selectedScreenPos].screenHeight;
    miniScreenConf.windows = [];
    // Transfer data from screen windows to mini windows format
    for (var i = 0; i < $scope.screens[$scope.selectedScreenPos].screenWindows.length; i++) {
      var dscmsWindow = $scope.screens[$scope.selectedScreenPos].screenWindows[i];
      var miniWindow = {};
      miniWindow.id = dscmsWindow.windowIdentifier;
      miniWindow.pixelWidth = dscmsWindow.windowPixelWidth;
      miniWindow.pixelHeight = dscmsWindow.windowPixelHeight;
      miniWindow.coordX = dscmsWindow.windowCoordX;
      miniWindow.coordY = dscmsWindow.windowCoordY;
      miniWindow.type = dscmsWindow.windowShape;

      // Set the hue for an empty window
      miniWindow.hue = "#3DCD95";

      // On click
      // TODO: Make this do something (e.g. select window for view)
      miniWindow.onClick = function (element, id) {
        if ($scope.windowIdToReplace === null) return;

        // First check if window is occupied (if so, we should abort)
        // Make a list of all filled windows
        var allViewWindows = [];
        for (var i = 0; i < $scope.thisScreenWinInf.views.length; i++)
          allViewWindows = allViewWindows.concat($scope.thisScreenWinInf.views[i].windows);

        var shouldContinue = true;
        $.grep(allViewWindows, function(e) {
          if (e.dsWindow === id) {
            dscmsNotificationCenter.danger("Oops!", "This window is already occupied.", 1500);
            shouldContinue = false;
          }
        });
        if (!shouldContinue) return;
        
        // When all is OK, update the window id
        $.grep($scope.thisScreenWinInf.views[$scope.selectedViewPos].windows, function(e) {
          if (e.dsWindow === $scope.windowIdToReplace) {
            resetColors();
            e.dsWindow = id;
            $scope.windowIdToReplace = null;
            showSelectedViewInPreview();
            $scope.$apply();
            return;
          }
        });
      };

      miniScreenConf.windows.push(miniWindow);
    }
    $scope.previewConfig = miniScreenConf;

    // When done, ask for the views associated with this screen (so we can fill the windows)
    dscmsWebSocket.sendServerMessage("requestwindows " + $scope.screens[$scope.selectedScreenPos].screenAddress + " " + $scope.themeName);
  }

  // =========================
  // Scope functions (mainly executed via ng-click)
  // =========================

  $scope.changeSelectedView = function(v) {
    $scope.thisScreenWinInf.views.forEach(function(e, i) {
      if (e === v) $scope.selectedViewPos = i;
    });
  };

  $scope.changeSelectedScreen = function(s) {

    if (angular.toJson($scope.thisScreenWinInf) !== angular.toJson($scope.thisScreenWinInfBackup)) {
      swal(
        {
          title: "Are you sure?",
          text: "You have unsaved changes. Screens can only be changed one by one.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Continue anyway",
          closeOnConfirm: true
        }, function(isConfirm) {
          if (isConfirm) {
            $scope.screens.forEach(function(e, i) {
              if (e === s) $scope.selectedScreenPos = i;
            });
            $scope.$apply();
          }
        });
    } else {
      $scope.screens.forEach(function(e, i) {
        if (e === s) $scope.selectedScreenPos = i;
      });
    }
  };

  $scope.cancelEdit = function() {
    $location.path('/');
  };

  $scope.saveEdit = function() {
    dscmsWebSocket.sendServerMessage(
      "updatetheme " +
      $scope.themeName +
      " " +
      angular.toJson($scope.thisScreenWinInf)
    );
    dscmsNotificationCenter.warning("Sorry!", "This feature is not yet implemented.", 2000);
  };

  $scope.startWindowReplace = function(win) {
    dscmsNotificationCenter.info("", "Click on a green window placeholder in the mini preview to move \"" + win.name + "\".", 3000);
    $scope.windowIdToReplace = win.dsWindow;
  };

  $scope.hasViewGotConfig = function(v) {
    if (v === undefined) return false;
    if (
      v.config === undefined ||
      v.config === null ||
      v.config.configItems === undefined ||
      v.config.configItems === null ||
      v.config.configItems.length === 0
    ) return false;

    return true;
  };

});
