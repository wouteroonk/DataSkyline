/*
  This controller
    * Makes a connection to the central DataSkyline server
    * Asks the DataSkyline server for info about this screen
    * Gets the views that should be shown from the server
    * Displays the views in the correct position on screen
    * Instantiates the javascript code for every view
  This controller does not
    * Actually contain the code that connects to the server (a function in the global script should be called)
    * Figure out how many views a module needs or what its properties are (this should already be done by the server)
      - MODULES are what the server uses and contain information such as theme,
        screen to show the module on, amount and size of views;
      - VIEWS are send to clients and are basically mini websites.
*/
dscms.app.controller('dscmsLiveSkylineCtrl', function($scope, $rootScope, $compile, dscmsWebSocket) {
  // TODO: Get views to show from WS
  // TODO: Instantiate views
  // TODO: Listen for updates from WS
  // Subscribe to websocket updates
  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    // Respond to various messages from server
    switch (commands.shift()) {

      // The windowinfo message contains information about the windows that should be shown,
      // such as:
      //  * Size, shape and position
      //  * Javascript file
      //  * HTML layout files
      case "windowinfo":
        // TODO: Fill screen, instantiate views
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.error("Server did not return JSON in windowinfo message: " + message.data);
          console.dir(message);
          return;
        }
        initWindow(returnedJSON);
        break;

        // The test message is used for testing purposes and should be deleted.
      case "test":
        console.log(message.data.substring(message.data.indexOf(' ') + 1));
        break;

      default:
        console.error("Unknown message received: " + message.data);
        console.dir(message);
    }
  });

  // Get own IP to send to server
  dscmsWebSocket.requestOwnLocalIP(function(ip) {
    // Ask server to send window info, handled by callback defined above
    dscmsWebSocket.requestWindowsForIP(ip);
  });

  var initWindow = function(data) {
    $rootScope.title = "DataSkyline - " + data.screenName;
    $scope.views = data.views;
    for ($scope.viewIt = 0; i < $scope.views; $scope.viewIt++) {
      // TODO: Create views, waiting for actual data
      $('#dscms-modules').append($compile("<dscms-view dscms-data-object='views[viewIt]'></dscms-view>")($scope));
    }
  };
});
