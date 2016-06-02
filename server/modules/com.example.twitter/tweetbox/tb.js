DSCMSView.run = function() {
  console.log("Hi! I am the script for the tweetbox view with ID " + $scope.dscmsViewId + " from the Twitter module!");
  $('#' + DSCMSViewTools.myWindows['Avatar Window'] + " img").attr('src', ($scope.dscmsViewId % 2) ? 'http://stockfresh.com/files/k/kurhan/m/13/1787983_stock-photo-young-business-woman.jpg' : 'http://pre12.deviantart.net/b384/th/pre/i/2013/175/f/6/male_stock_247_by_birdsistersstock-d5xmnrq.jpg');
  $('#' + DSCMSViewTools.myWindows['Text Window'] + " h1").text(($scope.dscmsViewId % 2) ? '@AbigailA:' : '@AdamW:');
  $('#' + DSCMSViewTools.myWindows['Text Window'] + " p").text(($scope.dscmsViewId % 2) ? 'Just finished Friends... What should I watch next? #helpme' : 'BIG news! I am getting married in two months!');
};
