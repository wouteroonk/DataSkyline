/**
  Created by Steyn Potze on 2016-06-07
  This controller is linked to the edit topic or "/topic/x" page and gets topic
  information from the server. The controller is very large and should probably
  be split up. But eh...
*/
dscms.app.controller('dscmsTopicCtrl', function($scope, $routeParams, $location, $modal, dscmsWebSocket, dscmsNotificationCenter, dscmsTools) {
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
  var subID = dscmsWebSocket.subscribe(function(message) {
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
      case 'removetopic':
        dscmsNotificationCenter.warning('Warning!', 'A topic was removed. To make sure bad stuff doesn\'t happen, we will cancel your edits and try to reload.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'updatetopic':
        dscmsNotificationCenter.info('', 'A topic was updated. Make sure this was you!');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'removemodule':
        dscmsNotificationCenter.warning('Warning!', 'A module was removed. To make sure bad stuff doesn\'t happen, we will cancel your edits and try to reload.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'addscreen':
        dscmsNotificationCenter.warning('Warning!', 'A screen was added. To make sure bad stuff doesn\'t happen, we will cancel your edits and try to reload.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'updatescreen':
        dscmsNotificationCenter.warning('Warning!', 'A screen was updated. To make sure bad stuff doesn\'t happen, we will cancel your edits and try to reload.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'removescreen':
        dscmsNotificationCenter.warning('Warning!', 'A screen was removed. To make sure bad stuff doesn\'t happen, we will cancel your edits and try to reload.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;

      default:
        // We don't need to handle this
    }
  }

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
  // Free windows are empty, taken windows are filled.
  function resetColors() {
    var alreadyFilled = [];
    // Make a list of all filled windows
    for (var i = 0; i < $scope.thisScreenWinInf.viewInstances.length; i++) {
      var viewInstance = $scope.thisScreenWinInf.viewInstances[i];
      for (var j = 0; j < viewInstance.windows.length; j++) {
        var thisWindow = viewInstance.windows[j];
        // Grab the associated bare window and color it
        // TODO: Can we move this function somewhere else? It is bad practice to create functions within a loop.
        $.grep($scope.previewConfig.windows, function(e){
          // We shouldn't do anything if this window is already filled
          if (alreadyFilled.indexOf(e.id) !== -1) return;
          if (e.id == thisWindow.locationID) {
            alreadyFilled.push(e.id);
            e.type = "filled";
            e.hint = viewInstance.instanceName + " - " + thisWindow.name;
            if (
              thisWindow.screenshotUrl !== undefined &&
              thisWindow.screenshotUrl !== null &&
              thisWindow.screenshotUrl !== ""
            ) {
              e.background = dscmsTools.serverUrl + "/modules/" + thisWindow.screenshotUrl;
            }
          } else {
            // To reset previously colored windows, make a non-match empty again
            e.type = "empty";
            e.hint = "Empty window";
          }
        });
      }
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
        if (e.id == thisWindow.locationID) {
          e.type = "selected";
          e.hint += " (selected)";
        }
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
      miniWindow.shape = dscmsWindow.shape;
      miniWindow.hint = "Empty window";

      // Set the hue for an empty window
      miniWindow.type = "empty";
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
          if (e.locationID === id) {
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

  function addViewBasedOnViewObject (viewObj, instanceName) {
    var newViewInstance = {};

    // Instance identifiers should be unique
    newViewInstance.instanceName = instanceName;
    // Fill rest with info from viewObj
    newViewInstance.viewName = viewObj.name;
    newViewInstance.viewFolderName = viewObj.folderName;
    newViewInstance.parentModuleFolderName = viewObj.viewParent.folderName;
    newViewInstance.jsProgramUrl = viewObj.jsProgramUrl;
    newViewInstance.config = viewObj.configTemplate;

    newViewInstance.windows = [];

    // We need to find the best fitting windowLocation for this window
    var availableWindows = getAvailableWindows();
    for (var i in viewObj.windows) {
      var windowObj = viewObj.windows[i];
      var newWindowInstance = {};

      newWindowInstance.bindingID = i;
      newWindowInstance.name = windowObj.name;
      newWindowInstance.folderName = windowObj.folderName;
      newWindowInstance.htmlUrl = windowObj.htmlUrl;
      newWindowInstance.screenshotUrl = windowObj.screenshotUrl;

      // If there are no available windows, stop adding and show warning.
      if (availableWindows.length === 0) {
        dscmsNotificationCenter.warning("Sorry!", "There is no space for this view at the moment. Please consider removing a view instance or adding the view to another screen.");
        return;
      }

      var selectedWindowLocation = null;
      // Order of importance:
      //  * shape
      //  * Aspect ratio

      var windowsWithShape = getWindowsWithShape(availableWindows, windowObj.preferredShape);
      if (windowsWithShape.length > 0) {
        var ar1 = windowObj.preferredWidth / windowObj.preferredHeight;
        var windowsWithShapeAndAR = getWindowsWithSimilarAspectRatio(windowsWithShape, ar1, 0.3);
        if (windowsWithShapeAndAR.length > 0) {
          selectedWindowLocation = windowsWithShapeAndAR[0];
        } else {
          selectedWindowLocation = windowsWithShape[0];
        }
      } else {
        var ar2 = windowObj.preferredWidth / windowObj.preferredHeight;
        var windowsWithAR = getWindowsWithSimilarAspectRatio(availableWindows, ar2, 0.3);
        if (windowsWithAR.length > 0) {
          selectedWindowLocation = windowsWithAR[0];
        } else {
          selectedWindowLocation = availableWindows[0];
        }
      }

      newWindowInstance.locationID = selectedWindowLocation.id;
      newWindowInstance.shape = selectedWindowLocation.shape;
      newWindowInstance.width = selectedWindowLocation.width;
      newWindowInstance.height = selectedWindowLocation.height;
      newWindowInstance.x = selectedWindowLocation.x;
      newWindowInstance.y = selectedWindowLocation.y;

      newViewInstance.windows.push(newWindowInstance);

      for (var j = 0; j < availableWindows.length; j++) {
        if (availableWindows[j].id === newWindowInstance.locationID) {
          availableWindows.splice(j, 1);
          break;
        }
      }
    }

    $scope.thisScreenWinInf.viewInstances.push(newViewInstance);
    $scope.selectedViewPos = $scope.thisScreenWinInf.viewInstances.length - 1;
    resetColors();
    showSelectedViewInPreview();
  }

  function getWindowsWithShape(windowlist, shape) {
    var matches = [];
    for (var i in windowlist) {
      if (windowlist[i].shape === shape) matches.push(windowlist[i]);
    }
    return matches;
  }

  function getWindowsWithSimilarAspectRatio(windowlist, aspectRatio, margin) {
    var matches = [];
    for (var i in windowlist) {
      var tempAR = windowlist[i].width / windowlist[i].height;
      if (tempAR <= aspectRatio + margin && tempAR >= aspectRatio - margin)
        matches.push(windowlist[i]);
    }
    return matches;
  }

  function getAvailableWindows() {
    var availableWindows = [];
    var allViewWindows = [];

    // Make a list of all filled windows
    for (var i = 0; i < $scope.thisScreenWinInf.viewInstances.length; i++)
      allViewWindows = allViewWindows.concat($scope.thisScreenWinInf.viewInstances[i].windows);

    // Loop through all windows for selected screen
    for (var j in $scope.screens[$scope.selectedScreenPos].windows) {
      var windowLocation = $scope.screens[$scope.selectedScreenPos].windows[j];
      // Compare window to configured windows for this topic/screen
      var match = false;
      for (var k in allViewWindows) {
        if (windowLocation.id !== allViewWindows[k].locationID) continue;
        match = true;
      }
      // If there is no match, the window is available
      if (!match) availableWindows.push(windowLocation);
    }
    return availableWindows;
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
    dscmsWebSocket.sendServerMessage("updatetopic " + angular.toJson($scope.thisScreenWinInf));
    $scope.thisScreenWinInfBackup = $scope.thisScreenWinInf;
  };

  // Set the windowIdToReplace variable to change window for a view
  // Also, give user instructions
  $scope.startWindowReplace = function(win) {
    dscmsNotificationCenter.info("", "Click on a empty window placeholder in the mini preview to move \"" + win.name + "\".", 3000);
    $scope.windowIdToReplace = win.locationID;
  };
  $scope.stopWindowReplace = function() {
    $scope.windowIdToReplace = null;
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
    modalInstance.result.then(function(result) {
      // We need more info before we can do adding
      if (result === undefined) return;
      addViewBasedOnViewObject(result.view, result.instanceName);
    });
  };

  $scope.deleteView = function(index) {
    swal(
      {
        title: "Are you sure?",
        text: "This will delete \"" + $scope.thisScreenWinInf.viewInstances[index].instanceName + "\" forever.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Delete",
        closeOnConfirm: true
      }, function(isConfirm) {
        // Tell server to delete topic if confirmed
        if (isConfirm) {
          if ($scope.thisScreenWinInf.viewInstances.length > 1) {
            $scope.selectedViewPos = 0;
          } else {
            $scope.selectedViewPos = null;
          }
          $scope.thisScreenWinInf.viewInstances.splice(index, 1);
          resetColors();
          showSelectedViewInPreview();
          $scope.$apply();
        }
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
