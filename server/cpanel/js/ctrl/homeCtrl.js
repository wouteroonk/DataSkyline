dscms.app.controller('dscmsHomeCtrl', function($scope, dscmsWebSocket) {
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
				console.log("check");
				$scope.modules = returnedJSON.modules;
				$scope.$apply();
				break;
      case "addtheme":
        if(message.data.substring(message.data.indexOf(' ') + 1) == 200){
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
	console.log("request");


  //new feature
  $scope.addTheme = function(){
    $scope.showThemeError = false;
    console.log("clicked");
    console.log($scope.themeName + " "+ $scope.themeDescription);
    if($scope.themeName === undefined){
      $scope.addThemeError = "The theme name field cannot be empty.";
      $scope.showThemeError = true;
      return;
    }
    if($scope.themeDescription === undefined){
      $scope.addThemeError = "The description field cannot be empty.";
      $scope.showThemeError = true;
      return;
    }
    var exists = false;
    $scope.themes.forEach(function(currentValue, index,arr){
      if(currentValue.name == $scope.themeName){
        $scope.addThemeError = "This theme name already exists, please choose another one.";
        $scope.showThemeError = true;
        exists = true;
      }
    });
    if(exists) return;
    dscmsWebSocket.sendServerMessage("addtheme " + $scope.themeName +" "+ $scope.themeDescription);
  }


});
