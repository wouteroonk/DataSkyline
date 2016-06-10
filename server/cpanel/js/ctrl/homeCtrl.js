dscms.app.controller('dscmsHomeCtrl', function($scope, dscmsWebSocket, $location, $modal) {
  $scope.themes = [];
  $scope.modules = [];
  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
      case "skylineupdate":
        dscmsWebSocket.sendServerMessage("getthemes");
        dscmsWebSocket.sendServerMessage("getmodules");
        break;
      case "getthemes":
        // Whatever you want to do
        //feature
        var returnedJSON;
        try {
          returnedJSON = JSON.parse(message.data.substring(message.data.indexOf(' ') + 1));
        } catch (e) {
          console.log("Server did not return JSON in allthemes message: " + message.data);
          console.dir(message);
          return;
        }
        // Do something with JSON
        $scope.themes = returnedJSON.themes;
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
      case "addtheme":
        if (message.data.substring(message.data.indexOf(' ') + 1) == 200) {
          console.log("added the theme");
          $('#add-theme-modal').modal('hide');
          return;
        } else {
          alert("Something went wrong Error: " + message.data);
        }
        return;
      default:
        break;
    }
  });
  dscmsWebSocket.sendServerMessage("getthemes");
  dscmsWebSocket.sendServerMessage("getmodules");
  dscmsWebSocket.requestOwnLocalIP(function(ip) {
    dscmsWebSocket.sendServerMessage("identification " + ip);
  });

  //new theme
  $scope.openAddThemeModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'cpanel/modals/addTheme.html',
      controller: 'dscmsAddThemeCtrl',
      resolve: {
        themes: function() {
          return $scope.themes;
        }
      }
    });

    modalInstance.result.then(function() {
      // TODO: Refresh theme list
    });
  };

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

  $scope.deleteModule = function(module) {
    console.dir(module);
    swal(
      {
        title: "Are you sure?",
        text: "This will delete \"" + module.moduleName + "\" forever.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Delete",
        closeOnConfirm: true
      }, function(isConfirm) {
        if (isConfirm) {
          dscmsWebSocket.sendServerMessage("removemodule " + module.moduleFolderName);
        }
      });
  };

  $scope.editTheme = function(theme) {
    $location.path('/themes/' + theme.name);
  };

});
