dscms.app.controller('dscmsViewCtrl', function($scope, $attrs, $http, $timeout, $compile) {
    // <dscms-view dscms-view-name="" dscms-view-manager-src="http://example.com/com.company.module/view/manager.js"></dscms-view>
    $scope.dscmsView = $scope.dscmsDataObject[$scope.dscmsViewId];

    // For some reason the dscms-view element cannot be found without this
    // TODO: Find out why
    $timeout(dscmsStartView, 0);

    function dscmsStartView() {
        // TODO: Add windows to screen
        for (var i = 0; i < $scope.dscmsView.windows.length; i++) {
            var windowIdentifier = "dscms-" + $scope.dscmsView.parentModule.split('.').join('-') + "-" + $scope.dscmsView.viewName.split(' ').join('-') + "-" + $scope.dscmsViewId + "-" + i;

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
            // Testing (move to css file when done)
            $('#' + windowIdentifier).css('border', 'solid 1px');

            // Load HTML
            dscmsAddHTMLToWindow(windowIdentifier, $scope.dscmsView.windows[i].htmlUrl);

        }

        // TODO: Integrate JS into this controller, without using eval()
        $('head').append("<script type='text/javascript' src='http://localhost:8080/modules/" + $scope.dscmsView.managerUrl + "'></script>");
    }

    // Downloads HTML and adds it to the window with the specified ID
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
