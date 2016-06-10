dscms.app.controller('dscmsModuleInfoCtrl', function($scope, $modalInstance, thisModule) {
  $scope.module = thisModule;

  $scope.close = function() {
    $modalInstance.close();
  };

});
