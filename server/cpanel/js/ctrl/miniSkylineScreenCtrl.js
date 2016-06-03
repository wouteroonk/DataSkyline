dscms.app.controller('dscmsMiniSkylineScreenCtrl', function($scope, $attrs, $element, dscmsWebSocket) {
  // Set the mini-skyline-screen object to block (default is inline)
  $element.css('display', 'block');

  $scope.ip = $attrs.ip;
  $scope.theme = $attrs.theme;
  
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
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.error("Server did not return JSON in windowinfo message: " + message.data);
          return;
        }
        createPreview(returnedJSON);
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

  dscmsWebSocket.requestWindowsForIP($scope.ip);

  function createPreview(json) {
    console.log("Received window info for ip " + $scope.ip);

    // Size
    var sW = 1920;
    var sH = 1080;
    var ratio = sW/sH;

    var eW = $element.width();
    var eH = $element.height();

    // Calculate the multiplier
    var mul = 1;
    // If no parent height and width are specified, use screen w & h (mul = 1)
    if (eH === 0 && eW === 0) {
      mul = 1;
    } else
    // If no parent width is specified, but height exists, use parent h / screen h as mul
    if (eW === 0) {
      mul = eH/sH;
    } else
    // If no parent height is specified, but width exists, use parent w / screen w as mul
    if (eH === 0) {
      mul = eW/sW;
    }
    // If parent has width and height, use the max size available
    else {
      mul = sH * (eW/sW) <= eH ? (eW/sW) : (eH/sH);
    }

    // If parent no w/h: use own w/h
    // If parent w, no h: use parent w, scaled h (keep ar)
    // If parent h, no w: use parent h, scaled w (keep ar)
    // If parent w/h: largest fit
    $element.append("<div class='dscms-mini-screen'>This is only a test</div>");

    var miniScreen = $element.children('.dscms-mini-screen');
    miniScreen.css("background-color", "red");
    miniScreen.css("width", sW * mul + "px");
    miniScreen.css("height", sH * mul + "px");
  }
});
