/**
  Created by Steyn Potze and Viradj Jainandunsing on 2016-06-10
  This controller is always coupled to a module info modal and provides module information.
*/
dscms.app.controller('dscmsModuleInfoCtrl', function($scope, $modalInstance, thisModule) {
  $scope.module = thisModule;

  $scope.close = function() {
    $modalInstance.close();
  };

});
