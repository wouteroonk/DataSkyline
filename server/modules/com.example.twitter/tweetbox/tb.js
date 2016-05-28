console.log("Hi! I am the script for the tweetbox view with ID " + $scope.dscmsViewId + " from the Twitter module!");
$('#' + DSCMSViewTools.myWindows['Avatar Window'] + " img").attr('src', ($scope.dscmsViewId % 2) ? 'https://pbs.twimg.com/profile_images/444885341661437953/osfNSOEm.jpeg' : 'https://pbs.twimg.com/profile_images/1980294624/DJT_Headshot_V2.jpg');
$('#' + DSCMSViewTools.myWindows['Text Window'] + " h1").text(($scope.dscmsViewId % 2) ? '@Llama89:' : '@realDonaldTrump:');
$('#' + DSCMSViewTools.myWindows['Text Window'] + " p").text(($scope.dscmsViewId % 2) ? 'Oh wow! I figured out how to tweet! #comingforyouhumans' : 'I love China!');
