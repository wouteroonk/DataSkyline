DSCMSView.run = function(DSCMSViewTools) {
  console.log("Hi! I am the script for the tweetbox view with ID " + $scope.dscmsViewId + " from the Twitter module!");
  var username = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
    return item.key === "username";
  })[0].value;
  var pictureUrl = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
    return item.key === "userimgurl";
  })[0].value;
  var tweetText = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
    return item.key === "tweettext";
  })[0].value;

  $('#' + DSCMSViewTools.myWindows['Avatar Window'] + " #user-image").attr('src', pictureUrl);
  $('#' + DSCMSViewTools.myWindows['Text Window'] + " #user-name").text(username + ':');
  $('#' + DSCMSViewTools.myWindows['Text Window'] + " #tweet-text").text(tweetText);
};
