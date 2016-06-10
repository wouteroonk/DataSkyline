dscms.app.controller('dscmsUploadModuleCtrl', function($scope, $http, $modalInstance, dscmsWebSocket) {

    $scope.selectedFileName = null;
    $scope.selectedFileSize = null;
    $scope.selectedFileSizeHR = null;

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

    $scope.fileSelected = function() {
        $scope.selectedFileName = $('#module-upload-file-input')[0].files[0].name;
        $scope.selectedFileSize = $('#module-upload-file-input')[0].files[0].size;
        $scope.selectedFileSizeHR = humanFileSize($scope.selectedFileSize, true);
        $scope.$apply();
    };

    function humanFileSize(bytes, si) {
        var thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    }

});
