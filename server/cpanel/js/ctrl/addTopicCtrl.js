/**
  Created by Hugo van der Geest and Steyn Potze on ???
  An instance of this controller is always coupled to an "add topic" modal.
  As the name says, this controller contains functionallity for adding a topic
  to the Dataskyline.
*/
dscms.app.controller('dscmsAddTopicCtrl', function($scope, $modalInstance, dscmsWebSocket, topics) {
  $scope.newTopicName = "";
  $scope.newTopicDescription = "";

  // Executed from ng-click on "Add topic" button
  $scope.addTopic = function(name, description) {
    $scope.showTopicError = false;

    // Check if a name has been entered
    if (name === undefined || name.trim().length === 0) {
      $scope.addTopicError = "Your topic needs a name.";
      $scope.showTopicError = true;
      return;
    }

    // Check if a description has been entered
    if (description === undefined || description.trim().length === 0) {
      $scope.addTopicError = "Your topic needs a description.";
      $scope.showTopicError = true;
      return;
    }

    // Check if the topic already exists
    var exists = false;
    topics.forEach(function(currentValue, index, arr) {
      if (currentValue.name == name) {
        $scope.addTopicError = "It seems like a topic with this name already exists.";
        $scope.showTopicError = true;
        exists = true;
        return;
      }
    });
    if (exists) return;

    // Tell the server to add the topic
    dscmsWebSocket.sendServerMessage("addtopic " + name + " " + description);

    $modalInstance.close();
  };

  // Executed from ng-click on "Cancel" and "Close modal" buttons
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  // Prevent user from entering space character (replace space with "-")
  $scope.nameKeydown = function(e) {
    if (e.keyCode == 32) {
      var maxLength = document.getElementById("newTopicNameInput").maxLength;
      if($scope.newTopicName.length < maxLength){
        $scope.newTopicName += "-"; // append '-' to input
      }
      e.preventDefault();
    }
  };

});
