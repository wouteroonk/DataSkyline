/**
  Created by Hugo van der Geest and Viradj Jainandunsing on ???
  This controller loads various items on the home page, such as a list of modules
  and a list of topics. It also instantiates the module upload and topic creation modals.
*/
dscms.app.controller('dscmsHomeCtrl', function($scope, dscmsWebSocket, dscmsNotificationCenter, $location, $modal) {
  $scope.pageClass = "dscms-page-home";

  $scope.topics = [];
  $scope.modules = [];
  $scope.screens = [];

  // Pagination for tables
  // modules
  $scope.modulesTableItemsPerPage = 5;
  $scope.modulesTableCurrentPage = 1;

  // topics
  $scope.topicsTableItemsPerPage = 5;
  $scope.topicsTableCurrentPage = 1;

  var subID = dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      case "gettopics":
        // Received JSON for all the topics.
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in alltopics message: " + message.data);
          console.dir(message);
          return;
        }
        // Do something with JSON
        $scope.topics = returnedJSON.topics;
        $scope.$apply();
        break;
      case "getmodules":
				// Received JSON for all the modules.
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in allmodules message: " + message.data);
          console.dir(message);
          return;
        }
        //Do something with JSON
        $scope.modules = returnedJSON.modules;
        $scope.$apply();
        break;
      case "getscreens":
				// Received JSON for all our screens.
        var returnedScreenJSON;
        try {
          returnedScreenJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in getscreens message: " + message.data);
          console.dir(message);
          return;
        }
        //Do something with JSON
        $scope.screens = returnedScreenJSON;
        $scope.$apply();
        break;
      case "addtopic":
				// Received confirmation that a topic was added.
        if (message.data.substring(message.data.indexOf(' ') + 1) == 200) {
          console.log("added the topic");
          $('#add-topic-modal').modal('hide');
          return;
        } else {
          alert("Something went wrong Error: " + message.data);
        }
        return;
      case 'skylineupdate':
        skylineUpdateHandler(commands.shift());
        break;
      default:
        break;
    }
  });

  $scope.$on("$destroy", function() {
    dscmsWebSocket.unsubscribe(subID);
  });

  // Handle updates from the server
  function skylineUpdateHandler(type) {
    switch (type) {
      case 'addtopic':
        dscmsNotificationCenter.info('', 'A new topic was added.');
        dscmsWebSocket.sendServerMessage("gettopics");
        break;
      case 'removetopic':
        dscmsNotificationCenter.info('', 'A topic was removed.');
        dscmsWebSocket.sendServerMessage("gettopics");
        break;
      case 'settopic':
        dscmsNotificationCenter.info('', 'A user changed the selected topic.');
        // TODO: Update the full preview
        break;
      case 'updatetopic':
        dscmsNotificationCenter.info('', 'A topic was updated.');
        dscmsWebSocket.sendServerMessage("gettopics");
        break;
      case 'uploadmodule':
        dscmsNotificationCenter.info('', 'A new module was uploaded.');
        dscmsWebSocket.sendServerMessage("getmodules");
        break;
      case 'removemodule':
        dscmsNotificationCenter.info('', 'A module was removed.');
        dscmsWebSocket.sendServerMessage("getmodules");
        break;
      case 'addscreen':
        dscmsNotificationCenter.info('', 'A new screen was added.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'updatescreen':
        dscmsNotificationCenter.info('', 'A screen was updated.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;
      case 'removescreen':
        dscmsNotificationCenter.info('', 'A screen was removed.');
        dscmsWebSocket.sendServerMessage("getscreens");
        break;

      default:
        // We don't need to handle this
    }
  }

  // Initial server communication
  dscmsWebSocket.sendServerMessage("gettopics");
  dscmsWebSocket.sendServerMessage("getmodules");
  dscmsWebSocket.sendServerMessage("getscreens");

  // Start a modal for adding a topic
  $scope.openAddTopicModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'cpanel/modals/addTopic.html',
      controller: 'dscmsAddTopicCtrl',
      resolve: {
        topics: function() {
          return $scope.topics;
        }
      }
    });
  };

  // Start a modal for adding a screen
  $scope.openAddScreenModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'cpanel/modals/addScreen.html',
      controller: 'dscmsAddScreenCtrl',
      resolve: {
        screens: function() {
          return $scope.screens;
        }
      }
    });
  };

  // Start a modal with info about a specified module
  $scope.openModuleInfoModal = function(module) {
    var modalInstance = $modal.open({
      templateUrl: 'cpanel/modals/moduleInfoModal.html',
      controller: 'dscmsModuleInfoCtrl',
      resolve: {
        thisModule: function() {
          return module;
        }
      }
    });
  };

  // Start a modal for uploading a module
  $scope.openUploadModuleModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'cpanel/modals/uploadModule.html',
      controller: 'dscmsUploadModuleCtrl',
      resolve: {

      }
    });
  };

  // Delete a screen (first ask for confirmation)
  $scope.deleteScreen = function(screen) {
    swal(
      {
        title: "Are you sure?",
        text: "This will delete \"" + screen.name + "\" forever.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Delete",
        closeOnConfirm: true
      }, function(isConfirm) {
        // Tell server to delete topic if confirmed
        if (isConfirm) {
          dscmsWebSocket.sendServerMessage('removescreen ' + screen.id);
        }
      });
  };

  $scope.editScreen = function(screen) {
    $location.path('/screens/' + screen.name);
  };

  // Delete a module (first ask for confirmation)
  $scope.deleteModule = function(module) {
    // Ask for confirmation
    swal(
      {
        title: "Are you sure?",
        text: "This will delete \"" + module.name + "\" forever.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Delete",
        closeOnConfirm: true
      }, function(isConfirm) {
        // Tell server to delete module if confirmed
        if (isConfirm) {
          dscmsWebSocket.sendServerMessage("removemodule " + module.folderName);
        }
      });
  };

	// Delete a topic (first ask for confirmation)
  $scope.deleteTopic = function(topic) {
    // Ask for confirmation
    swal(
      {
        title: "Are you sure?",
        text: "This will delete \"" + topic.name + "\" forever.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Delete",
        closeOnConfirm: true
      }, function(isConfirm) {
        // Tell server to delete topic if confirmed
        if (isConfirm) {
          dscmsWebSocket.sendServerMessage("removetopic " + topic.name);
        }
      });
  };

  // Go to the edit page for the selected topic
  $scope.editTopic = function(topic) {
    $location.path('/topics/' + topic.name);
  };

});
