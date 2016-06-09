dscms.app.controller('dscmsThemeCtrl', function($scope, $routeParams, dscmsWebSocket) {
  $scope.themeName = $routeParams.theme;
  $scope.selectedScreen = null;
  $scope.screens = [];
  $scope.windowsForCurrentScreen = {};
  $scope.viewsForCurrentScreen = {};
  $scope.configForCurrentView = {
    configItems: [
      {
        name: "user",
        value: "taylorswift13"
      },
      {
        name: "delaySec",
        value: "5"
      }
    ]
  };

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
        fillWindows(returnedWindowJSON);
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
        if ($scope.screens.length > 0) $scope.selectedScreen = $scope.screens[0];
        $scope.$apply();
        break;
    }
  });

  // Request screen data
  dscmsWebSocket.sendServerMessage("getscreens");

  // Execute function when another screen has been selected
  $scope.$watch('selectedScreen', function() {
    // Fail-safe
    if ($scope.selectedScreen === null) return;

    // Load empty windows
    var miniScreenConf = {};
    miniScreenConf.screenWidth = $scope.selectedScreen.screenWidth;
    miniScreenConf.screenHeight = $scope.selectedScreen.screenHeight;
    miniScreenConf.windows = [];
    // Transfer data from screen windows to mini windows format
    for (var i = 0; i < $scope.selectedScreen.screenWindows.length; i++) {
      var dscmsWindow = $scope.selectedScreen.screenWindows[i];
      var miniWindow = {};
      miniWindow.id = dscmsWindow.windowIdentifier;
      miniWindow.pixelWidth = dscmsWindow.windowPixelWidth;
      miniWindow.pixelHeight = dscmsWindow.windowPixelHeight;
      miniWindow.coordX = dscmsWindow.windowCoordX;
      miniWindow.coordY = dscmsWindow.windowCoordY;
      miniWindow.type = dscmsWindow.windowShape;

      // Set the hue for an empty window
      miniWindow.hue = "#00AA00";

      // On click
      // TODO: Make this do something (e.g. select window for view)
      miniWindow.onClick = function (element, id) {
        console.log(id);
      };

      miniScreenConf.windows.push(miniWindow);
    }
    $scope.windowsForCurrentScreen = miniScreenConf;

    // When done, ask for the views associated with this screen (so we can fill the windows)
    dscmsWebSocket.sendServerMessage("requestwindows " + $scope.selectedScreen.screenAddress + " " + $scope.themeName);
  }, true);

  // Fill windows with views
  function fillWindows(windowinfo) {
    $scope.viewsForCurrentScreen = windowinfo.views;
    var allViewWindows = [];
    for (var i = 0; i < $scope.viewsForCurrentScreen.length; i++)
      allViewWindows = allViewWindows.concat($scope.viewsForCurrentScreen[i].windows);

    for (var j = 0; j < allViewWindows.length; j++) {
      var thisWindow = allViewWindows[j];
      $.grep($scope.windowsForCurrentScreen.windows, function(e){
        if (e.id == thisWindow.dsWindow)
          e.hue = "#E27703";
      });
    }
    $scope.$apply();
  }

});
