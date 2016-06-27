/**
  Created by Steyn Potze on 2016-06-10
  An instance of this controller is always coupled to the big Skyline preview on the home page.
  This controller creates previews for all available Dataskyline screens for the current topic.
  Using this feature, the user is able to see what the Dataskyline is showing,
  without being on location.
*/
dscms.app.controller('dscmsBigHomePreviewCtrl', function($scope, dscmsWebSocket, dscmsTools) {

  $scope.previewScreens = [];
  $scope.previewConfigs = {};

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
        handleWindowInfo(returnedWindowJSON);
        $scope.$apply();
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
        $scope.previewScreens = returnedScreenJSON;
        fillScreensWithWindowLocations();
        $scope.$apply();
        // Create the config objects

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
        fillScreensWithWindowLocations();
        break;
      case 'settopic':
        fillScreensWithWindowLocations();
        break;
      case 'updatetopic':
        fillScreensWithWindowLocations();
        break;
      case 'removemodule':
        fillScreensWithWindowLocations();
        break;
      case 'addscreen':
        fillScreensWithWindowLocations();
        break;
      case 'updatescreen':
        fillScreensWithWindowLocations();
        break;
      case 'removescreen':
        fillScreensWithWindowLocations();
        break;

      default:
        // We don't need to handle this
    }
  }

  // Ask the server for screens
  dscmsWebSocket.sendServerMessage('getscreens');

  // Fill every screen with window locations
  function fillScreensWithWindowLocations() {
    for (var i = 0; i < $scope.previewScreens.length; i++) {
      var thisConfig = {};

      // Basic screen info
      thisConfig.screenWidth = $scope.previewScreens[i].width;
      thisConfig.screenHeight = $scope.previewScreens[i].height;
      thisConfig.windows = [];

      // windows
      for (var j = 0; j < $scope.previewScreens[i].windows.length; j++) {
        var windowLocation = $scope.previewScreens[i].windows[j];
        var previewWindow = {};

        // Copy information
        previewWindow.id = windowLocation.id;
        previewWindow.pixelWidth = windowLocation.width;
        previewWindow.pixelHeight = windowLocation.height;
        previewWindow.coordX = windowLocation.x;
        previewWindow.coordY = windowLocation.y;
        previewWindow.shape = windowLocation.shape;
        previewWindow.hint = "Empty window (" + windowLocation.id + ")";
        previewWindow.type = "empty";

        // Add to windows list
        thisConfig.windows.push(previewWindow);
      }
      // Add config to list
      $scope.previewConfigs[$scope.previewScreens[i].name] = thisConfig;
      // Request windowinfo for this screen
      dscmsWebSocket.sendServerMessage('requestwindows ' + $scope.previewScreens[i].address);
    }
  }

  // Handle a window info message and update the matching screen
  function handleWindowInfo(windowinfo) {
    for (var i = 0; i < $scope.previewScreens.length; i++) {
      // Only edit screen matching windowinfo
      if ($scope.previewScreens[i].name != windowinfo.screenName) continue;
      // Keep a list of filled windows
      var alreadyFilled = [];
      // Loop through view instances
      for (var j = 0; j < windowinfo.viewInstances.length; j++) {
        for (var k = 0; k < windowinfo.viewInstances[j].windows.length; k++) {
          $.grep($scope.previewConfigs[$scope.previewScreens[i].name].windows, function(e) {
            // Do nothing if we already filled this window
            if(alreadyFilled.indexOf(e.id) !== -1) return;
            if (e.id == windowinfo.viewInstances[j].windows[k].locationID) {
              alreadyFilled.push(e.id);
              e.type = "filled";
              e.hint = windowinfo.viewInstances[j].instanceName + " - " + windowinfo.viewInstances[j].windows[k].name;
              if (
                windowinfo.viewInstances[j].windows[k].screenshotUrl !== undefined &&
                windowinfo.viewInstances[j].windows[k].screenshotUrl !== null &&
                windowinfo.viewInstances[j].windows[k].screenshotUrl !== ""
              ) {
                e.background = dscmsTools.serverUrl + "/modules/" + windowinfo.viewInstances[j].windows[k].screenshotUrl;
              }
            } else {
              e.type = "empty";
              e.hint = "Empty window (" + e.id + ")";
              e.background = null;
            }
          });
        }
      }
    }
  }
});
