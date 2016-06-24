/**
  Created by Hugo van der Geest and Viradj Jainandunsing on ???
  This controller loads various items on the home page, such as a list of modules
  and a list of topics. It also instantiates the module upload and topic creation modals.
*/
dscms.app.controller('dscmsHomeCtrl', function($scope, dscmsWebSocket, $location, $modal) {
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

  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      case "skylineupdate":
				//Received update from the server. So we need to reload the topics and modules.
        dscmsWebSocket.sendServerMessage("gettopics");
        dscmsWebSocket.sendServerMessage("getmodules");
        break;
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
      default:
        break;
    }
  });

  // Initial server communication
  dscmsWebSocket.sendServerMessage("gettopics");
  dscmsWebSocket.sendServerMessage("getmodules");
  dscmsWebSocket.sendServerMessage("getscreens");
  dscmsWebSocket.requestOwnLocalIP(function(ip) {
    dscmsWebSocket.sendServerMessage("identification " + ip);
  });

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
    dscmsNotificationCenter.warning('Sorry.', 'This feature is not yet implemented.', 2000);
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
