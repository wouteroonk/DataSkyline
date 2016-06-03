/**
    Created by Steyn Potze on 2016-06-03
    Last updated by Steyn Potze on 2016-06-03 (Added windows (from windowinfo message! Need to change this))
    This controller creates a mini preview for a specified Dataskyline screen,
    Controller is linked to the miniSkylineScreen directive.
**/

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
        break;
    }
  });

  dscmsWebSocket.requestWindowsForIP($scope.ip);

  function createPreview(json) {

    // Store the screens dimensions in local variables and calculate aspect ratio
    var sW = json.screenWidth;
    var sH = json.screenHeight;
    var ratio = sW/sH;

    // Store the mini-skyline-screen elements dimensions in local variables
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
    $element.append("<div class='dscms-mini-screen'></div>");

    var miniScreen = $element.children('.dscms-mini-screen');
    miniScreen.css("position", "relative");
    miniScreen.css("width", sW * mul + "px");
    miniScreen.css("height", sH * mul + "px");

    var allWindows = [];
    for (var i in json.views) {
      allWindows = allWindows.concat(json.views[i].windows);
    }
    for (var j in allWindows) {
      var id = 'dscms-mini-preview-screen-part-' + j;
      miniScreen.append("<div class='dscms-mini-screen-window' id='" + id + "'></div>");

      if (allWindows[j].type === "ellipse") {
        $('#' + id).addClass("dscmsEllipse");
      }

      // Size
      $("#" + id).css("width", (allWindows[j].pixelWidth * mul) + "px");
      $("#" + id).css("height", (allWindows[j].pixelHeight * mul) + "px");

      // Position
      $("#" + id).css("position", "absolute");
      $("#" + id).css("top", (allWindows[j].coordY * mul) + "px");
      $("#" + id).css("left", (allWindows[j].coordX * mul) + "px");

    }
  }
});
