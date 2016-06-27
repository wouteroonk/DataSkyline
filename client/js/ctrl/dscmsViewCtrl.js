// Created by Steyn Potze
// The dscmsViewCtrl controller is used to instantiate and run a view.
// Views will run inside of the controller scope.
dscms.app.controller('dscmsViewCtrl', function($scope, $attrs, $http, $timeout, $compile, dscmsWebSocket, dscmsTools) {
  $scope.dscmsView = $scope.dscmsDataObject[$scope.dscmsViewId];

  // Contains the run code for this view.
  var DSCMSView = {
    // The run function will be executed when all windows have been added to the DOM
    run: function() {
      console.error("View \"" + $scope.dscmsView.name + "\" does not have a valid Javascript file.");
    }
  };

  // The DSCMSViewTools object is a set of tools that can be used in the views own JS code
  var DSCMSViewTools = {
    // Name of the view type
    myName: $scope.dscmsView.name,
    // Name of the parent module
    mywidth: $scope.dscmsView.parentModuleFolderName,
    // List of DOM IDs for this views windows, with window name as key
    myWindows: {},
    // The config file for this view instance as defined on the server
    myConfig: $scope.dscmsView.config,
    // The address of this views folder on the server
    myAddress: dscmsTools.serverUrl + '/modules/' + $scope.dscmsView.parentModuleFolderName + '/' + $scope.dscmsView.viewFolderName
  };

  // For some reason the dscms-view element cannot be found without this
  // TODO: Find out why
  $timeout(dscmsStartView, 0);

  // Create windows and append their HTML, start Javascript and exec run method when windows are ready.
  function dscmsStartView() {

    // Loop through windows and add them to the screen
    for (var i = 0; i < $scope.dscmsView.windows.length; i++) {
      // Create a unique window identifier
      var windowIdentifier = "dscms-" + $scope.dscmsView.parentModuleFolderName.split('.').join('-') + "-" + $scope.dscmsView.viewName.split(' ').join('-') + "-" + $scope.dscmsViewId + "-" + i;
      // Store the identifier in a list for the view manager
      DSCMSViewTools.myWindows[$scope.dscmsView.windows[i].name] = windowIdentifier;

      // Create window
      $('#dscms-view-' + $scope.dscmsViewId).append("<div id='" + windowIdentifier + "'></div>");

      // Change shape to ellipse if view requires it
      // Default is rectangle
      if ($scope.dscmsView.windows[i].shape === "ellipse") {
        $('#' + windowIdentifier).addClass("dscmsEllipse");
      }
      // Size
      $('#' + windowIdentifier).css('width', $scope.dscmsView.windows[i].width);
      $('#' + windowIdentifier).css('height', $scope.dscmsView.windows[i].height);
      // Position
      $('#' + windowIdentifier).css('position', 'absolute');
      $('#' + windowIdentifier).css('top', $scope.dscmsView.windows[i].y + "px");
      $('#' + windowIdentifier).css('left', $scope.dscmsView.windows[i].x + "px");
      // Testing (so we can see window borders)
      $('#' + windowIdentifier).css('border', 'dashed 1px');

      // Load HTML
      dscmsAddHTMLToWindow(windowIdentifier, $scope.dscmsView.windows[i].htmlUrl);

    }

    // Get the views Javascript file from the server and instantiate it
    $http({
      method: 'GET',
      url: dscmsTools.serverUrl + "/modules/" + $scope.dscmsView.jsProgramUrl
    }).then(function success(response) {
      dscmsRunJS(response.data);
    }, function error(response) {
      // TODO: Error message?
    });

  }

  // This function initiates the views Javascript code
  function dscmsRunJS(js) {
    // Okay. I can explain this.
    // I know. Eval is generally seen as the worst thing you can use in Javascript.
    // But that is only because people use it to do hacky things, which usually involves user input.
    // And yes, passing user input to eval is a very bad idea.
    // But in this case, we need to execute module code in a certain scope, without the risk
    // of it interferring with other views. So eval is perfect for that. And besides that,
    // We are not working with very sensitive data anyway.
    // ~~~~~
    // There probably is a better way to do this though.
    eval(js);

    // Wait for view to be ready and then execute the run method.
    dscmsExecOnViewReady(function() {
      // TODO: Pass handy variables
      DSCMSView.run(DSCMSViewTools);
    });
  }

  // Wait for view to be ready and then execute callback method.
  function dscmsExecOnViewReady(callback) {
    setTimeout(
      function() {
        // Check if view is ready
        if (dscmsIsViewReady()) {
          if (callback !== null) {
            callback();
          }
          return;

        } else {
          console.log("Could not execute, view not ready. Retrying...");
        }

      }, 50);
  }

  // Returns true if all windows are present in the DOM.
  function dscmsIsViewReady() {
    for (var winId in DSCMSViewTools.myWindows) {
      if (DSCMSViewTools.myWindows.hasOwnProperty(winId)) {
        if ($('#' + DSCMSViewTools.myWindows[winId]).length === 0) {
          return false;
        }
      }
    }
    return true;
  }

  // Download HTML and add it to the window with the specified ID
  function dscmsAddHTMLToWindow(windowId, htmlUrl) {
    $http({
      method: 'GET',
      url: dscmsTools.serverUrl + "/modules/" + htmlUrl
    }).then(function success(response) {
      $('#' + windowId).append($compile(response.data)($scope));
    }, function error(response) {
      // TODO: Load error view?
    });
  }
});
