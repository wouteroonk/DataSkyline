/**
  Created by Wouter Oonk
*/

dscms.app.controller('dscmsDocumentationCtrl', function($scope, $location, dscmsWebSocket) {
    $scope.pageClass = "dscms-page-documentation";

    $scope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {

        angular.element(document.querySelector('#dscms-global-info-nav')).addClass('active');
        $scope.gotoId($location.hash());

    });

    $(function() {
        var currentHash = "";
        $(document).scroll(function() {
            $('.anchor').each(function() {
                var top = window.pageYOffset;
                var distance = top - $(this).offset().top;
                var hash = $(this).attr('id');
                // 30 is an arbitrary padding choice,
                // if you want a precise check then use distance===0
                if (distance < 81 && distance > -81 && currentHash != hash) {
                    angular.element(document.querySelector('.active')).removeClass('active');
                    angular.element(document.querySelector('#' + hash + '-nav')).addClass('active');
                    currentHash = hash;
                }
            });
        });
    });

    $scope.gotoId = function(eID) {

        // This scrolling function
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

        eID = eID === "" ? "#dscms-global-info-nav" : eID;

        var startY = currentYPosition();
        var stopY = elmYPosition(eID) - 80;
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY);
            return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for (var i = startY; i < stopY; i += step) {
                setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
                leapY += step;
                if (leapY > stopY) leapY = stopY;
                timer++;
            }
            return;
        }
        for (var j = startY; j > stopY; j -= step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY -= step;
            if (leapY < stopY) leapY = stopY;
            timer++;
        }

        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }

        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            if (elm !== null) {
                var y = elm.offsetTop;
                var node = elm;
                while (node.offsetParent && node.offsetParent != document.body) {
                    node = node.offsetParent;
                    y += node.offsetTop;
                }
                return y;
            }
        }
    };
});
