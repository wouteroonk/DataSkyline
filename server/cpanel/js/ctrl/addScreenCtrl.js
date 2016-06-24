/**
  Created by Steyn Potze on 2016-06-22
  An instance of this controller is always coupled to an "add screen" modal.
  As the name says, this controller contains functionallity for adding a screen
  to the Dataskyline.
*/
dscms.app.controller('dscmsAddScreenCtrl', function($scope, $modalInstance, dscmsWebSocket, dscmsNotificationCenter, screens) {

  // Executed from ng-click on "Add screen" button
  $scope.addScreen = function(name, address, description, width, height) {
    var newScreen = {};

    // Check if a name has been entered
    if (
      name === undefined || name === null || name.trim().length === 0 ||
      address === undefined || address === null || address.trim().length === 0 ||
      description === undefined || description === null || description.trim().length === 0 ||
      width === undefined || width === null || width.trim().length === 0 ||
      height === undefined || height === null || height.trim().length === 0
    ) {
      dscmsNotificationCenter.warning('Oops!', 'You forgot to fill in one or more fields.', 2000);
      return;
    }

    newScreen.name = name;
    newScreen.address = address;
    newScreen.description = description;
    newScreen.width = width;
    newScreen.height = height;

    // Tell the server to add the screen
    dscmsWebSocket.sendServerMessage("addscreen " + JSON.stringify(newScreen));

    $modalInstance.close();
  };

  // Executed from ng-click on "Cancel" and "Close modal" buttons
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

});
