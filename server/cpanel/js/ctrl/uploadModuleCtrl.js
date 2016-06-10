dscms.app.controller('dscmsUploadModuleCtrl', function($scope, $http, $modalInstance, dscmsWebSocket) {
  $scope.uploadModule = function() {
    var file = $('#module-upload-file-input')[0].files[0];

    var fd = new FormData();
    fd.append("file", file);

    $http.post("/", fd, {
      withCredentials: true,
      headers: {
        'Content-Type': undefined
      },
      transformRequest: angular.identity
    }).success(function(res) {
      console.log(":)");
      console.dir(res);
    }).error(function() {
      console.log(":(");
    });

    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});
