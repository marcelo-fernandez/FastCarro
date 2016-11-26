'use strict';

var medApp = angular.module('Zeroclube', ['ngRoute','ngMap','angularSpinner','firebase','chart.js'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'web_cliente/main.html',
                controller: 'mainPageCtrl'
                
            })
            .when('/step1', {
                templateUrl: 'web_cliente/wizard1.html',
                controller: 'step1Ctrl',
            })
            .when('/step2', {
                templateUrl: 'web_cliente/wizard2.html',
                controller: 'step2Ctrl',
            })
            .when('/step3', {
                templateUrl: 'web_cliente/wizard3.html',
                controller: 'step3Ctrl',
            })
            .when('/admin', {
                templateUrl: 'web_admin/admin.html',
                controller: 'adminCtrl',
            })
            .when('/confirma', {
                templateUrl: 'web_cliente/confirma.html',
                controller: 'confirmaCtrl',
            })
            
    })
    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit(attr.onFinishRender);
                    });
                }
            }
        }
    })
    .directive( 'onReady', function( $parse ) {
        return {
           restrict: 'A',
           link: function( $scope, elem, attrs ) {    
              elem.ready(function(){
                $scope.$apply(function(){
                    var func = $parse(attrs.elemReady);
                    func($scope);
                })
              })
           }
        }
    })
    .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                  //Also remove . and , so its gives a cleaner result.
                  if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });


