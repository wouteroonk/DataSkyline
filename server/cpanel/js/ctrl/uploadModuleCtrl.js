/**
  Created by Hugo van der Geest and Steyn Potze on 2016-06-10
  This controller is linked to the module upload modal and can upload a zip file
  to the server.
*/
dscms.app.controller('dscmsUploadModuleCtrl', function($scope, $http, $modalInstance, dscmsWebSocket) {

    $scope.selectedFileName = null;
    $scope.selectedFileSize = null;
    $scope.selectedFileSizeHR = null;

    // Executed from ng-click on "upload" button
    $scope.uploadModule = function() {
        // Get the file from the file input
        var file = $('#module-upload-file-input')[0].files[0];

        // "Convert" file to formdata format so that the server can read it
        var fd = new FormData();
        fd.append("file", file);

        // Post the file to the server
        // TODO: Make a specific endpoint for this
        $http.post("/", fd, {
            withCredentials: true,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: angular.identity
        }).success(function(res) {
            // TODO: Do something on success?
        }).error(function() {
            // TODO: Show error?
        });

        $modalInstance.close();
    };

    // Executed from ng-click on "cancel" and "close modal" buttons
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // Executed from onchange on file input
    // When a new file is selected, update file info parameters.
    // If file info parameters are available, they are shown on screen. If not,
    // the user will see something like "Click here to upload zip..."
    $scope.fileSelected = function() {
        $scope.selectedFileName = $('#module-upload-file-input')[0].files[0].name;
        $scope.selectedFileSize = $('#module-upload-file-input')[0].files[0].size;
        $scope.selectedFileSizeHR = humanFileSize($scope.selectedFileSize, true);
        $scope.$apply();
    };

    // This helper function converts bytes to a human readable format,
    // e.g. 19891213 becomes 19.9 MB
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
