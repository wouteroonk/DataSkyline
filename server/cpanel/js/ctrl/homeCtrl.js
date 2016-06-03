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
      default:
        break;
    }
  });
  dscmsWebSocket.requestThemeList();
	dscmsWebSocket.requestModuleList();


  //new feature
  $scope.addTheme = function(){
    console.log("clicked");
    console.log($scope.themeName + " "+ $scope.themeDescription);
    if($scope.themeName === undefined){
      alert("The theme name field cannot be empty.");
      return;
    }
    if($scope.themeDescription === undefined){
      alert("The description field cannot be empty.");
      return;
    }
    var exists = false;
    $scope.themes.forEach(function(currentValue, index,arr){

    });


  }


});
