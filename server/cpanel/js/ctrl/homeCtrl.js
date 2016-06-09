dscms.app.controller('dscmsHomeCtrl', function($scope, dscmsWebSocket, $location) {
  $scope.themes = [];
  $scope.modules = [];
  dscmsWebSocket.subscribe(function(message) {
    var commands = message.data.split(' ');
    switch (commands.shift()) {
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
          //TODO: change this
          var t = new Object();
          t.name = $scope.newThemeName;
          $scope.themes.push(t);
          $scope.$apply();
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
  console.log("request");



  //new theme
  $scope.addTheme = function() {
    $scope.showThemeError = false;
    //console.log($scope.newThemeName + " " + $scope.newThemeDescription);
    if ($scope.newThemeName === undefined || $scope.newThemeName.trim().length == 0) {
      $scope.addThemeError = "The theme name field cannot be empty.";
      $scope.showThemeError = true;
      return;
    }
    if ($scope.newThemeDescription === undefined || $scope.newThemeDescription.trim().length == 0) {
      $scope.addThemeError = "The description field cannot be empty.";
      $scope.showThemeError = true;
      return;
    }
    var exists = false;
    $scope.themes.forEach(function(currentValue, index, arr) {
      if (currentValue.name == $scope.newThemeName) {
        $scope.addThemeError = "This theme name already exists, please choose another one.";
        $scope.showThemeError = true;
        exists = true;
        return;
      }
    });
    if (exists) return;
    dscmsWebSocket.sendServerMessage("addtheme " + $scope.newThemeName + " " + $scope.newThemeDescription);
  };

  $scope.openModuleModal = function(mapName){
    console.log(mapName);
    $scope.modules.forEach(function(currentValue, index,arr){
      console.log(currentValue);
      if(currentValue.mapName === mapName){
        $scope.moduleInfoMapName = currentValue.mapName;
        $scope.moduleInfoName = currentValue.moduleName;
        $scope.moduleInfoDescription = currentValue.moduleDescription;
        $scope.moduleInfoDeveloper = currentValue.moduleDeveloper;
        $scope.moduleInfoLicense = currentValue.moduleLicense;
      }
    });

  }

  $scope.editTheme = function (theme) {
    $location.path('/themes/' + theme.name);
  };

  $("#newThemeNameInput").on('keydown', function(){
    var key = event.keyCode || event.charCode;
    if(key === 32){
      $scope.addThemeError = "The theme name cannot contain blanks.";
      $scope.showThemeError = true;
      $scope.$apply();
      return false;
    }
    if(key === 13){
      console.log("pressed");
      $scope.addTheme();
      $scope.$apply();
      return;
    }
  });

  $("#newThemeDescriptionInput").on('keydown', function(){
    var key = event.keyCode || event.charCode;
    if(key === 13){
      $scope.addTheme();
      $scope.$apply();
      return;
    }
  });

});
