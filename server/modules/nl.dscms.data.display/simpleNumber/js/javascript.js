$scope.currentValue;
$scope.intervalID = 0;
$scope.busy = false;

$scope.titleValue;
$scope.textcolor;
$scope.bgcolor;

DSCMSView.run = function() {
	
	var defaultVal = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
        return item.key === "default";
    })[0].value;
	var title = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
        return item.key === "title";
    })[0].value;
	var bgcolor = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
		return item.key === "bgcolor";
    })[0].value;
	var textcolor = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
		return item.key === "textcolor";
    })[0].value;
	
	if(defaultVal !== "") {
		$scope.currentValue = parseInt(defaultVal);
	}

	if(title !== "") {
		$scope.titleValue = title;
	}
	
	if(bgcolor !== "" || textcolor !== "") {
		updateColors(textcolor, bgcolor);
	}

$scope.autoupdate = function(finalValue, interval) {
	if(!$scope.busy){
		console.log("Start");
		$scope.intervalID = setInterval(function(){
		$scope.busy = true;
		var changedval = giveNewValue($scope.currentValue, finalValue);
		$scope.currentValue = changedval;
		$scope.$apply();
		if($scope.currentValue === finalValue) stopUpdate($scope.intervalID);
		}, interval);
	} else {
		console.error("System is already calculating");
	}
}

$scope.$apply();
}

function updateColors(textcolor, bgcolor) {
	$scope.textcolor = {"color":textcolor};
	$scope.bgcolor = {"background-color":bgcolor};
	$scope.$apply();
}

// Example function, calling $scope.autoupdate(number, interval) will change the current number to the given number, interval(in milliseconds) is used to define the speed in which the data updates
changeStuff();
function changeStuff() {
	setInterval(function() {
		$scope.autoupdate(Math.floor((Math.random() * 5000) + 1),100);
	}, 5000);
}

function stopUpdate(iid) {
	console.log("Stop");
	$scope.busy = false;
	clearInterval(iid);
}

function giveNewValue(currentValue, finalValue) {
	var newval = currentValue - finalValue
	if(newval < 0) { // ophogen
		newval = Math.abs(newval);
		if(newval > 100) {
			return currentValue +100;
		}
		if(newval > 10) {
			return currentValue +10;
		}
		return currentValue +1;
	} else if (newval > 0) { // verlagen
		if(newval > 100) {
			return currentValue -100;
		}
		if(newval > 10) {
			return currentValue -10;
		}
		return currentValue -1;
	} else { // hetzelfde
		return finalValue;
	}
}