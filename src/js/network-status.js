'use strict';

angular.module('network-status', [])
  .factory('ConnectionStatus', ['$rootScope', '$q', '$injector', '$interval', '$timeout', 'appConfig', function($rootScope, $q, $injector, $interval, $timeout, appConfig) {

    var latency = 0;
    var startTime = 0;
    var promiseStarted = false;

    return {
      request: function(config) {
        if(config.url.indexOf('{0}/healthcheck'.format([appConfig.backendURL])) > -1) {
          startTime = +new Date();
          return config;
        }
        if(config.url.indexOf('.html') > -1) {
          return config;
        }
        var http = $injector.get('$http');
        return http.get('{0}/healthcheck'.format([appConfig.backendURL])).then(
          function (response) {
            if (response.data.result === 'OK'){
              $rootScope.connection.isApiAccessible = true;
              $rootScope.connection.countDown = 15;
              return config;
            }
            $rootScope.connection.isApiAccessible = false;
            itIsTheFinalCountDown();
            return $q.reject(config);
          },
          function(error) {
            if (error.status === 502)
              $rootScope.connection.isApiAccessible = false;
            itIsTheFinalCountDown();
            return $q.reject(config);
          });
      },
      requestError: function(request) {
        if (request.status === 502){
          $rootScope.connection.isApiAccessible = false;
          itIsTheFinalCountDown();
          return $q.reject(request);
        }
      },
      response: function(response) {
        if(response.config.url.indexOf('{0}/healthcheck'.format([appConfig.backendURL])) > -1) {
          $rootScope.connection.isLatencyOkay = true;
          latency = (+new Date()) - startTime;
          if (latency > 1500){
            $rootScope.connection.isLatencyOkay = false;
          }
        }
        return response;
      }
    };

    function itIsTheFinalCountDown() {
      if (!promiseStarted){
        promiseStarted = true;
        var promise = $interval(function(){
          $rootScope.connection.countDown--;
          if($rootScope.connection.countDown === 0){
            var http = $injector.get('$http');
            return http.get('{0}/healthcheck'.format([appConfig.backendURL])).then(
              function (response) {
                if (response.data.result === 'OK') {
                  promiseStarted = false;
                  $interval.cancel(promise);
                  $rootScope.connection.isApiAccessible = true;
                  $rootScope.connection.countDown = 15;
                  return response;
                }
                $rootScope.connection.countDown = 18;
                $rootScope.connection.showTryFailed = true;
                $timeout(function() {
                  $rootScope.connection.showTryFailed = false;
                }, 3000);
                return response;
              },
              function(error) {
                $rootScope.connection.countDown = 18;
                $rootScope.connection.showTryFailed = true;
                $timeout(function() {
                  $rootScope.connection.showTryFailed = false;
                }, 3000);
                return error;
              });
          }
        },1000,0);
      }
    }
  }])
  .directive('connectionStatus', ['$rootScope', '$interval', function($rootScope, $interval) {
    return {
      restrict: 'E',
      scope: {
        url: '@url',
        version: '@version',
        template: function() {
          return [
            '<li class="iam-online" title="Você possui conexão com a internet" ng-if="connection.iamOnline && connection.isLatencyOkay"><i class="fa fa-wifi" aria-hidden="true"></i></li>',
            '<li class="iam-lagging" title="Sua conexão com a internet está lenta" ng-if="!connection.isLatencyOkay"><i class="fa fa-wifi" aria-hidden="true"></i></li>',
            '<li class="iam-not-online" title="Você não possui conexão com a internet" ng-if="!connection.iamOnline"><img src="../img/notwifi.svg" alt=""></li>'
          ].join('');
        }
      },
      link: function(scope, elm, attrs, ctrl) {
        var getInternetStatus = function(){
          $rootScope.connection.iamOnline = false;
          if (navigator.onLine) {
            $rootScope.connection.iamOnline = true;
          }
        };
        $interval(getInternetStatus, 1500);
      }
    }
  }])
  .directive('apiStatus', ['$rootScope', '$httpProvider', function($rootScope, $httpProvider) {
    return {
      restrict: 'E',
      scope: {
        url: '@url',
        version: '@version',
        template: function() {
          return [
            '<section class="status-server container">',
              '<h3>Você não esta conseguindo se conectar com ao nosso servidor.</h3>',
              '<span>',
                '<h4 ng-show="!connection.showTryFailed">Aguarde, tentaremos reconectar em {{connection.countDown}} segundos...</h4>',
              '</span>',
              '<span ng-show="connection.showTryFailed">',
                '<h4>Nova tentativa falhou, verifique sua conexão com a internet.</h4>',
              '</span>',
              '<div class="loader"></div>',
            '</section>'
          ].join('');
        }
      },
      link: function(scope, elm, attrs, ctrl) {
        $httpProvider.interceptors.push('ConnectionStatus');
      }
    }
  }]);