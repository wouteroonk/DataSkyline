DSCMSView.run = function(DSCMSViewTools) {
  console.log("Hi! I am the script for the youtube view with ID " + $scope.dscmsViewId + " from the Youtube module!");
  var playlistId = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
    return item.key === "playlistId";
  })[0].value;
  
  var muted = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
    return item.key === "muted";
  })[0].value;
  
 var scripts = document.getElementsByTagName("script");
  var included = false;
  for(var i = 0; i < scripts.length; i++){
	  if(scripts[i].src == "https://www.youtube.com/player_api"){
		  included = true;
		  break;
	  }
  }
  
  if(!included){ //good practice
	// Load the IFrame Player API code asynchronously.
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/player_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }


  // Replace the 'ytplayer' element with an <iframe> and
  // YouTube player after the API code downloads.
	var player;
	onYouTubePlayerAPIReady = function() {
		//newYoutubePlayer();
		window.youtubeApiReady = true;
	}
	
	function waitForApi() { //bad practice there's probably a better(angular), more efficient implementation for this.
		if(window.youtubeApiReady !=true) {
			setTimeout(waitForApi, 50); //the onYouTubePlayerAPIReady function is only called in one of the views
										//this means that loading multiple videos wont work if there are multiple
										//onYouTubePlayerAPIReady functions (only one video will be displayed).
			return;
		}
		newYoutubePlayer(); //the api is loaded, creating a new youtube player
	}
	waitForApi();
	
  function newYoutubePlayer(){
	 player = new YT.Player(DSCMSViewTools.myWindows['Youtube playlist'], {
     height: '100%',
     width: '100%',
	 playerVars : {
                  'autoplay' : 1,
				  'listType' : 'playlist',
                  'rel' : 0,
                  'showinfo' : 0,
                  'showsearch' : 0,
                  'controls' : 0,
                  'loop' : 1,
                  'enablejsapi' : 1,
				  'iv_load_policy'	: 3,
                  'list': playlistId
                },
	  events: {
            'onReady': onPlayerReady,
          }
		});
  }
  
  function onPlayerReady(event){
	  event.target.playVideo();
	  if(muted == "true"){
			player.mute();
		}
  }
};


  