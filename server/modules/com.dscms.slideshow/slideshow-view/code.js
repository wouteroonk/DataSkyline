DSCMSView.run = function() {
	console.log("Hi! I am the script for the slideshow view with ID " + $scope.dscmsViewId + " from the slideshow module!");
  var imageUrls = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
    return item.key === "urls";
  })[0].value;
  var time = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
    return item.key === "time";
  })[0].value;
  if(time == ""){
	  time = 5000;
  }
	var urls = imageUrls.split(",");
	for(var i = 0; i < urls.length; i++){
		$("#"+DSCMSViewTools.myWindows['slideshow-window']).append('<img class="'+DSCMSViewTools.myWindows['slideshow-window'] +'class" src="'+urls[i]+'" style="width: 100%; height:100%;">' );
	}
	
	var myIndex = 0;
	if(imageUrls.length > 1){
		carousel();
	}
	

	function carousel() {
		var i;
		var x = document.getElementsByClassName(DSCMSViewTools.myWindows['slideshow-window']+"class");
		for (i = 0; i < x.length; i++) {
		   x[i].style.display = "none";
		}
		myIndex++;
		if (myIndex > x.length) {myIndex = 1}
		x[myIndex-1].style.display = "block";
		setTimeout(carousel, time);
	}
}
