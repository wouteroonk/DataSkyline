/**
  Created by Steyn Potze on 2016-06-10
  An instance of this controller is always coupled to the big Skyline preview on the home page.
  This controller creates previews for all available Dataskyline screens for the current topic.
  Using this feature, the user is able to see what the Dataskyline is showing,
  without being on location.
*/
dscms.app.controller('dscmsBigHomePreviewCtrl', function($scope, dscmsWebSocket) {

  $scope.screens = [];

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
        break;
      case 'settopic':
        break;
      case 'updatetopic':
        break;
      case 'removemodule':
        break;
      case 'addscreen':
        break;
      case 'updatescreen':
        break;
      case 'removescreen':
        break;

      default:
        // We don't need to handle this
    }
  }
});
