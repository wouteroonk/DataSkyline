/**
  Created by Hugo van der Geest and Viradj Jainandunsing on ???
  This controller loads various items on the home page, such as a list of modules
  and a list of topics. It also instantiates the module upload and topic creation modals.
*/
dscms.app.controller('dscmsHomeCtrl', function($scope, dscmsWebSocket, $location, $modal) {
  $scope.pageClass = "dscms-page-home";

  $scope.topics = [];
  $scope.modules = [];

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
        dscmsWebSocket.sendServerMessage("gettopics");
        dscmsWebSocket.sendServerMessage("getmodules");
        break;
      case "gettopics":
        // Whatever you want to do
        //feature
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
      case "addtopic":
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

    modalInstance.result.then(function() {
      // TODO: Refresh topic list
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

	// Delete a module (first ask for confirmation)
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
        // Tell server to delete module if confirmed
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
