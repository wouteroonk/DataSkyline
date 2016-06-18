/**
  Created by Steyn Potze on 2016-06-07
  This controller is linked to the edit topic or "/topic/x" page and gets topic
  information from the server. The controller is very large and should probably
  be split up. But eh...
*/
dscms.app.controller('dscmsTopicCtrl', function($scope, $routeParams, $location, $modal, dscmsWebSocket, dscmsNotificationCenter) {
  $scope.pageClass = "dscms-page-topic";

  $scope.topicName = $routeParams.topic;

  // A screen is a physical screen, or client
  // The index of the selected screen
  $scope.selectedScreenPos = null;
  // We sometimes need the full object for the selected screen
  // This object should not be used for modifictation
  $scope.tempScreenSelect = null;
  // List of screens
  $scope.screens = [];

  // Windowinfo message with backup for modification check
  $scope.thisScreenWinInf = null;
  $scope.thisScreenWinInfBackup = null;

  // List of "empty" windows for the selected screen
  // This list is used as the config json for mini-skyline-screen.
  $scope.previewConfig = null;

  // The index of the selected view within the selected screen
  $scope.selectedViewPos = null;

  // The ID of the window that should be changed (by clicking in the preview)
  $scope.windowIdToReplace = null;

  // =========================
  // WebSocket stuff
  // =========================

  // Subscribe to the WebSocket to listen for updates
  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      // Windowinfo message for getting the views that are associated with the selected screen
      case "windowinfo":
        // Parse JSON
        var returnedWindowJSON;
        try {
          returnedWindowJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in windowinfo message: " + message.data);
          console.dir(message);
          return;
        }
        console.dir(returnedWindowJSON);
        addWindowsToPreview(returnedWindowJSON);
        break;
      // Getscreens message for getting the screens and their description
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
      if (obj.screenName === $scope.tempScreenSelect.name) {
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
    for (var i = 0; i < $scope.thisScreenWinInf.viewInstances.length; i++)
      allViewWindows = allViewWindows.concat($scope.thisScreenWinInf.viewInstances[i].windows);

    // Keep a list of windows that are orange to prevent override
    var alreadyOrange = [];
    // Loop through filled windows and color them
    for (var j = 0; j < allViewWindows.length; j++) {
      var thisWindow = allViewWindows[j];
      // Grab the associated bare window and color it
      // TODO: Can we move this function somewhere else? It is bad practice to create functions within a loop.
      $.grep($scope.previewConfig.windows, function(e){
        // We shouldn't do anything if this window is already orange
        if (alreadyOrange.indexOf(e.id) !== -1) return;
        if (e.id == thisWindow.locationID) {
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
    // Ahh, copying objects... (need to use angular.toJson to strip angular attrs)
    $scope.thisScreenWinInf = JSON.parse(angular.toJson(windowinfo));
    $scope.thisScreenWinInfBackup = JSON.parse(angular.toJson(windowinfo));

    // If there is a view for this screen, select it
    if ($scope.thisScreenWinInf.viewInstances.length > 0) $scope.selectedViewPos = 0;
    showSelectedViewInPreview();
    $scope.$apply();
  }

  // Show specific info related to the selected screen on the preview
  // Changes colors of windows used by selected view to blue
  function showSelectedViewInPreview() {
    if ($scope.selectedViewPos === null || $scope.thisScreenWinInf === null) return;
    resetColors();
    if ($scope.thisScreenWinInf.viewInstances.length === 0) return;
    for (var j = 0; j < $scope.thisScreenWinInf.viewInstances[$scope.selectedViewPos].windows.length; j++) {
      var thisWindow = $scope.thisScreenWinInf.viewInstances[$scope.selectedViewPos].windows[j];
      // TODO: Can we move this function somewhere else? It is bad practice to create functions within a loop.
      $.grep($scope.previewConfig.windows, function(e){
        if (e.id == thisWindow.locationID)
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
      miniWindow.type = dscmsWindow.shape;

      // Set the hue for an empty window
      miniWindow.hue = "#3DCD95";
      // TODO: We need preview images (server side)

      // On click, check if a window needs replacing. If so, replace it with clicked window.
      miniWindow.onClick = function (element, id) {
        if ($scope.windowIdToReplace === null) return;

        // First check if window is occupied (if so, we should abort)
        // Make a list of all filled windows
        var allViewWindows = [];
        for (var i = 0; i < $scope.thisScreenWinInf.viewInstances.length; i++)
          allViewWindows = allViewWindows.concat($scope.thisScreenWinInf.viewInstances[i].windows);

        // Loop through all windows and check if occupied
        var shouldContinue = true;
        $.grep(allViewWindows, function(e) {
          if (e.dsWindow === id) {
            dscmsNotificationCenter.danger("Oops!", "This window is already occupied.", 1500);
            shouldContinue = false;
          }
        });
        if (!shouldContinue) return;

        // When all is OK, update the window id
        $.grep($scope.thisScreenWinInf.viewInstances[$scope.selectedViewPos].windows, function(e) {
          if (e.locationID === $scope.windowIdToReplace) {
            resetColors();
            e.locationID = id;
            $scope.windowIdToReplace = null;
            showSelectedViewInPreview();
            $scope.$apply();
            return;
          }
        });
      };

      // Add the created window to the miniscreen configuration object
      miniScreenConf.windows.push(miniWindow);
    }
    $scope.previewConfig = miniScreenConf;

    // When done, ask for the views associated with this screen (so we can fill the windows)
    dscmsWebSocket.sendServerMessage("requestwindows " + $scope.screens[$scope.selectedScreenPos].address + " " + $scope.topicName);
  }

  // =========================
  // Scope functions (mainly executed via ng-click)
  // =========================

  // Select another view
  $scope.changeSelectedView = function(v) {
    $scope.thisScreenWinInf.viewInstances.forEach(function(e, i) {
      if (e === v) $scope.selectedViewPos = i;
    });
  };

  // Select another screen
  $scope.changeSelectedScreen = function(s) {
    // Warn the user when changes have not been saved
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
          // If the user still wants to change screens, do it
          if (isConfirm) {
            $scope.screens.forEach(function(e, i) {
              if (e === s) $scope.selectedScreenPos = i;
            });
            $scope.$apply();
          }
        });
    } else {
      // When there are no changes, just change screens
      $scope.screens.forEach(function(e, i) {
        if (e === s) $scope.selectedScreenPos = i;
      });
    }
  };

  // Cancel topic edit (go back to home)
  $scope.cancelEdit = function() {
    // Warn the user when changes have not been saved
    if (angular.toJson($scope.thisScreenWinInf) !== angular.toJson($scope.thisScreenWinInfBackup)) {
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

  // Save the edits for the selected screen and topicName
  // TODO: This needs server side implementation
  // NOTE: Object sent to server is fully compatible with windowinfo message
  $scope.saveEdit = function() {
    dscmsWebSocket.sendServerMessage(
      "updatewindowinfo " +
      $scope.topicName +
      " " +
      $scope.screens[$scope.selectedScreenPos].address +
      " " +
      angular.toJson($scope.thisScreenWinInf)
    );
  };

  // Set the windowIdToReplace variable to change window for a view
  // Also, give user instructions
  $scope.startWindowReplace = function(win) {
    dscmsNotificationCenter.info("", "Click on a green window placeholder in the mini preview to move \"" + win.name + "\".", 3000);
    $scope.windowIdToReplace = win.locationID;
  };

  // Check if the selected view has configurable options
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

  // Instantiate an add view modal
  $scope.openAddViewModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'cpanel/modals/addViewToTopic.html',
      controller: 'dscmsAddViewToTopicCtrl',
      resolve: {

      }
    });

    // Modal will probably return view object. Add it to windowinfo and reload preview
    modalInstance.result.then(function(returnedView) {
      // We need more info before we can do adding
      console.log("What we have");
      console.dir(returnedView);
      console.log("What we need");
      console.dir($scope.thisScreenWinInf.viewInstances[0]);
    });
  };

  // =========================
  // Tooltips
  // =========================

  $('[data-toggle="general-tooltip"]').tooltip({
    'selector': '',
    'placement': 'top',
    'container':'body'
  });

});
