dscms.app.controller('dscmsHomeCtrl', function($scope, dscmsWebSocket) {
  $scope.themes = [];
  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      case "allthemes":
        // Whatever you want to do
        //feature
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in allthemes message: " + message.data);
          console.dir(message);
          return;
        }
        // Do something with JSON
        $scope.themes = returnedJSON.themes;
        $scope.$apply();

        break;
      default:
        console.error("Unkowm message received: "+ message.data);
        console.dir(message);
    }
  });
  dscmsWebSocket.requestThemeList();


});
