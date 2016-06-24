$scope.discoBG = {"background-color":"rgb(15, 102, 102)"};
$scope.speed = 80;

DSCMSView.run = function() {
	var speed = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
        return item.key === "speed";
    })[0].value;
	
	if(speed !== "") {
		$scope.speed = parseInt(speed);
	}
	
	setInterval(function() {
		var newrgb = getRandomRGB();
		$scope.discoBG = {"background-color":newrgb};
		$scope.$apply();
	},$scope.speed);
	
}
function getRandomRGB() {
	var val1 = Math.floor((Math.random() * 255) + 1);
	var val2 = Math.floor((Math.random() * 255) + 1);
	var val3 = Math.floor((Math.random() * 255) + 1);
	return "rgb("+val1+","+val2+","+val3+")";
}