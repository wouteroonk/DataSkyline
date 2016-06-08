dscms.app.controller('dscmsThemeCtrl', function($scope, $routeParams, dscmsWebSocket) {
  $scope.themeName = $routeParams.theme;
  $scope.selectedScreen = null;
  $scope.screens = [];
  $scope.windowsForCurrentScreen = {
    screenWidth: '2160',
    screenHeight: '3840',
    windows: [{
      // Basic window info
      pixelWidth: '500',
      pixelHeight: '500',
      coordX: '40',
      coordY: '40',
      type: 'ellipse',

      // Styling
      hue: '#FFFFFF',
      background: 'https://pbs.twimg.com/profile_images/720767103712645122/6XEBAXLj.jpg',

      // The onclick function is obviously called when the generated window is clicked
      onClick: function(element) {},
    }]
  };

  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      case "windowinfo":
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in windowinfo message: " + message.data);
          console.dir(message);
          return;
        }
        // Call method for filling the preview window
        break;
      case "getscreens":
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in getscreens message: " + message.data);
          console.dir(message);
          return;
        }
        $scope.screens = returnedJSON;
        $scope.$apply();
        break;
    }
  });

  dscmsWebSocket.sendServerMessage("getscreens");

  $scope.$watch('selectedView', function(oldVar, newVar) {

  }, true);

  function updateScreenPreview(windowinfo) {

  }
});
