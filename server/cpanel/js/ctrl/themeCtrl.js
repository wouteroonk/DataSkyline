dscms.app.controller('dscmsThemeCtrl', function($scope, $routeParams, dscmsWebSocket) {
  $scope.themeName = $routeParams.theme;
  $scope.selectedScreen = null;
  $scope.screens = [];
  $scope.windowsForCurrentScreen = {};

  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      case "windowinfo":
        var returnedWindowJSON;
        try {
          returnedWindowJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in windowinfo message: " + message.data);
          console.dir(message);
          return;
        }
        loadScreenSettings(returnedWindowJSON);
        break;
      case "getscreens":
        var returnedScreenJSON;
        try {
          returnedScreenJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in getscreens message: " + message.data);
          console.dir(message);
          return;
        }
        $scope.screens = returnedScreenJSON;
        if ($scope.screens.length > 0) $scope.selectedScreen = $scope.screens[0];
        $scope.$apply();
        break;
    }
  });

  dscmsWebSocket.sendServerMessage("getscreens");

  $scope.$watch('selectedScreen', function() {
    if ($scope.selectedScreen === null) return;
    console.dir($scope.selectedScreen);
    // Temporarily load empty windows
    var miniScreenConf = {};
    miniScreenConf.screenWidth = $scope.selectedScreen.screenWidth;
    miniScreenConf.screenHeight = $scope.selectedScreen.screenHeight;
    miniScreenConf.windows = [];
    for (var i = 0; i < $scope.selectedScreen.screenWindows.length; i++) {
      var dscmsWindow = $scope.selectedScreen.screenWindows[i];
      var miniWindow = {};
      miniWindow.pixelWidth = dscmsWindow.windowPixelWidth;
      miniWindow.pixelHeight = dscmsWindow.windowPixelHeight;
      miniWindow.coordX = dscmsWindow.windowCoordX;
      miniWindow.coordY = dscmsWindow.windowCoordY;
      miniWindow.type = dscmsWindow.windowShape;

      miniWindow.hue = "#00AA00";
      miniScreenConf.windows.push(miniWindow);
    }
    $scope.windowsForCurrentScreen = miniScreenConf;

    // $scope.$apply(function () {
    //   $scope.windowsForCurrentScreen = miniScreenConf;
    //   $scope.test = "Yo moma";
    // });

    dscmsWebSocket.sendServerMessage("requestwindows " + $scope.selectedScreen.screenAddress + " " + $scope.themeName);
  }, true);

  function loadScreenSettings(windowinfo) {
  }
});
