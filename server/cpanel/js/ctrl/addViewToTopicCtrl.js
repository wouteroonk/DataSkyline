/**
  Created by Steyn Potze on 2016-06-10
  An instance of this controller is always coupled to an "add view to topic" modal.
  As the name says, this controller contains functionallity for a view instance  to a topic.
  It also subscribes to the websocket connection to get a list of modules and their views.
*/
dscms.app.controller('dscmsAddViewToTopicCtrl', function($scope, $modalInstance, dscmsWebSocket, dscmsNotificationCenter) {
    $scope.newView = {};
    $scope.views = [];
    $scope.selectedViewPos = null;

    dscmsWebSocket.subscribe(function(message) {
        var commands = message.data.split(' ');
        switch (commands.shift()) {
            case "getmodules":
                var returnedJSON;
                try {
                    returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
                } catch (e) {
                    console.log("Server did not return JSON in getmodules message: " + message.data);
                    console.dir(message);
                    return;
                }
                $scope.views = [];
                $.each(returnedJSON.modules, function(i, module) {
                  $.each(module.views, function(i, view) {
                    view.viewParent = module;
                  });
                  $scope.views = $scope.views.concat(module.views);
                });
                $scope.$apply();
                break;
        }
    });

    dscmsWebSocket.sendServerMessage("getmodules");

    $scope.changeViewPos = function(index) {
      $scope.selectedViewPos = index;
    };

    $scope.addView = function() {
        if ($scope.views[$scope.selectedViewPos] === undefined) {
          dscmsNotificationCenter.danger("Whoops!", "You need to select a view to add to the topic.", 2000);
          return;
        }
        $modalInstance.close($scope.views[$scope.selectedViewPos]);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});
