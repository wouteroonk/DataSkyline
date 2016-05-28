dscms.app.controller('dscmsViewCtrl', function($scope, $attrs, $http, $timeout, $compile) {
    $scope.dscmsView = $scope.dscmsDataObject[$scope.dscmsViewId];

    // The DSCMSViewTools object is a set of tools that can be used in the views own JS code
    var DSCMSViewTools = {
        // Name of the view type
        myName: $scope.dscmsView.viewName,
        // Name of the parent module
        myParentModule: $scope.dscmsView.parentModule,
        // List of DOM IDs for this views windows, with window name as key
        myWindows: {},
        // The config file for this view instance as defined on the server
        myConfig: {},
    };

    // For some reason the dscms-view element cannot be found without this
    // TODO: Find out why
    $timeout(dscmsStartView, 0);

    function dscmsStartView() {

        // Loop through windows and add them to the screen
        for (var i = 0; i < $scope.dscmsView.windows.length; i++) {
            // Create a unique window identifier
            var windowIdentifier = "dscms-" + $scope.dscmsView.parentModule.split('.').join('-') + "-" + $scope.dscmsView.viewName.split(' ').join('-') + "-" + $scope.dscmsViewId + "-" + i;
            // Store the identifier in a list for the view manager
            DSCMSViewTools.myWindows[$scope.dscmsView.windows[i].name] = windowIdentifier;

            // Create window
            $('#dscms-view-' + $scope.dscmsViewId).append("<div id='" + windowIdentifier + "'></div>");

            // Change shape to ellipse if view requires it
            // Default is rectangle
            if ($scope.dscmsView.windows[i].type === "ellipse") {
                $('#' + windowIdentifier).addClass("dscmsEllipse");
            }
            // Size
            $('#' + windowIdentifier).css('width', $scope.dscmsView.windows[i].pixelWidth);
            $('#' + windowIdentifier).css('height', $scope.dscmsView.windows[i].pixelHeight);
            // Position
            $('#' + windowIdentifier).css('position', 'absolute');
            $('#' + windowIdentifier).css('top', $scope.dscmsView.windows[i].coordY + "px");
            $('#' + windowIdentifier).css('left', $scope.dscmsView.windows[i].coordX + "px");
            // Testing (so we can see window borders)
            $('#' + windowIdentifier).css('border', 'dashed 1px');

            // Load HTML
            dscmsAddHTMLToWindow(windowIdentifier, $scope.dscmsView.windows[i].htmlUrl);

        }

        // Get the views Javascript file from the server and instantiate it
        $http({
            method: 'GET',
            url: "http://localhost:8080/modules/" + $scope.dscmsView.managerUrl
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
    }

    // Download HTML and add it to the window with the specified ID
    function dscmsAddHTMLToWindow(windowId, htmlUrl) {
        $http({
            method: 'GET',
            url: "http://localhost:8080/modules/" + htmlUrl
        }).then(function success(response) {
            $('#' + windowId).append($compile(response.data)($scope));
        }, function error(response) {
            // TODO: Load error view?
        });
    }
});
