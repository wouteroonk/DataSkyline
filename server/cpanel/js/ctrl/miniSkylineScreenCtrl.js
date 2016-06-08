/**
    Created by Steyn Potze on 2016-06-03
    Last updated by Steyn Potze on 2016-06-08 (Refactored to depend on window information given by parent scope, added background styling stuff)
    This controller creates a mini preview for a specified Dataskyline screen,
    Controller is linked to the miniSkylineScreen directive.

    The directive depends on a 'windows' object passed by the parent controller.
    The structure of this object is specified below.
**/

dscms.app.controller('dscmsMiniSkylineScreenCtrl', function($scope, $element) {
  // Set the mini-skyline-screen object to block (default is inline)
  $element.css('display', 'block');

  // Watch the windows variable for changes and update the element accordingly
  // Third argument is true to check for value equality instead of reference equality.
  $scope.$watch('windows', function(oldVal, newVal) {
    $element.empty();
    addWindowsToElement(newVal, $element);
  }, true);

  // Fill the preview based on JSON
  // {
  //   screenWidth: '0',
  //   screenHeight: '0',
  //   windows: [
  //     {
  //       // Basic window info
  //       pixelWidth: '0',
  //       pixelHeight: '0',
  //       coordX: '0',
  //       coordY: '0',
  //       shape: 'rectangle',
  //
  //       // Styling
  //       hue: '#FFFFFF',
  //       background: 'http://www.example.com/ts.img',
  //
  //       // The onclick function is obviously called when the generated window is clicked
  //       onClick: function(element){},
  //     }
  //   ]
  // };
  function addWindowsToElement(screenData, screenElement) {

    // Store the screens dimensions in local variables and calculate aspect ratio
    var sW = screenData.screenWidth;
    var sH = screenData.screenHeight;
    var ratio = sW / sH;

    // Store the mini-skyline-screen elements dimensions in local variables
    var eW = screenElement.width();
    var eH = screenElement.height();

    // Calculate the multiplier
    var mul = 1;
    // If no parent height and width are specified, use screen w & h (mul = 1)
    if (eH === 0 && eW === 0) {
      mul = 1;
    } else
    // If no parent width is specified, but height exists, use parent h / screen h as mul
    if (eW === 0) {
      mul = eH / sH;
    } else
    // If no parent height is specified, but width exists, use parent w / screen w as mul
    if (eH === 0) {
      mul = eW / sW;
    }
    // If parent has width and height, use the max size available
    else {
      mul = sH * (eW / sW) <= eH ? (eW / sW) : (eH / sH);
    }

    // If parent no w/h: use own w/h
    // If parent w, no h: use parent w, scaled h (keep ar)
    // If parent h, no w: use parent h, scaled w (keep ar)
    // If parent w/h: largest fit
    screenElement.append("<div class='dscms-mini-screen'></div>");

    var miniScreen = screenElement.children('.dscms-mini-screen');
    miniScreen.css("position", "relative");
    miniScreen.css("width", sW * mul + "px");
    miniScreen.css("height", sH * mul + "px");

    var allWindows = screenData.windows;
    for (var j in allWindows) {
      var id = 'dscms-mini-preview-screen-part-' + j;
      miniScreen.append("<div class='dscms-mini-screen-window'></div>");
      var thisWindow = miniScreen.children('.dscms-mini-screen-window').last();

      if (allWindows[j].type === "ellipse") {
        thisWindow.addClass("dscmsEllipse");
      }

      // Size
      thisWindow.css("width", (allWindows[j].pixelWidth * mul) + "px");
      thisWindow.css("height", (allWindows[j].pixelHeight * mul) + "px");

      // Position
      thisWindow.css("position", "absolute");
      thisWindow.css("top", (allWindows[j].coordY * mul) + "px");
      thisWindow.css("left", (allWindows[j].coordX * mul) + "px");

      // Color, background, etc
      var rgb = hexToRgb(allWindows[j].hue);
      if (rgb === null) {
        allWindows[j].hue = "#FFFFFF";
        rgb = hexToRgb(allWindows[j].hue);
      }

      if (allWindows[j].background !== undefined) {
        thisWindow.css("background", "url(" + allWindows[j].background + ")");
        thisWindow.css("background-size", "100% 100%");
        thisWindow.append("<div class='dscms-mini-screen-window-hue' style='background-color: rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.25);'></div>");
      } else {
        thisWindow.css("background", "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",1)");
      }

      // Click callback
      thisWindow.click(function() {
        allWindows[j].onClick(thisWindow);
      });

    }
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
});
