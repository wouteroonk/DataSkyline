$scope.discoBG = {"background-color":"rgb(15, 102, 102)"};

DSCMSView.run = function() {
	setInterval(function() {
		var newrgb = getRandomRGB();
		$scope.discoBG = {"background-color":newrgb};
		$scope.$apply();
	},80);
}
function getRandomRGB() {
	var val1 = Math.floor((Math.random() * 255) + 1);
	var val2 = Math.floor((Math.random() * 255) + 1);
	var val3 = Math.floor((Math.random() * 255) + 1);
	return "rgb("+val1+","+val2+","+val3+")";
}