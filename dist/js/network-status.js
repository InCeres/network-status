'use strict';

angular.module('networkStatus', [])
  .factory('ConnectionStatus', ['$rootScope', '$q', '$injector', '$interval', '$timeout', 'appConfig', function($rootScope, $q, $injector, $interval, $timeout, appConfig) {

    var latency = 0;
    var startTime = 0;
    var promiseStarted = false;

    return {
      'request': function(config) {
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
            if (error.status === 502){
              $rootScope.connection.isApiAccessible = false;
              itIsTheFinalCountDown();
              return $q.reject(error.config);
            }
            return error.config;
          });
      },
      'responseError': function(response) {
        if (response.status === 502){
          $rootScope.connection.isApiAccessible = false;
          itIsTheFinalCountDown();
          return $q.reject(response);
        }
        return response;
      },
      'response': function(response) {
        if(response.config.url.indexOf('{0}/healthcheck'.format([appConfig.backendURL])) > -1) {
          $rootScope.connection.isLatencyOkay = true;
          latency = (+new Date()) - startTime;
          if (latency > 1500){
            $rootScope.connection.isLatencyOkay = false;
            $rootScope.connection.message = 'Sua conexão com a Internet está lenta';
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
      replace: true,
      template: function() {
        return [
          '<li class="icon-wifi" ng-class="{\'iam-online\': connection.iamOnline && connection.isLatencyOkay, \'iam-lagging\': !connection.isLatencyOkay, \'iam-not-online\': !connection.iamOnline}" title="{{connection.message}}">',
          '<i class="fa fa-wifi online" aria-hidden="true" ng-if="connection.iamOnline && connection.isLatencyOkay"></i>',
          '<i class="fa fa-wifi lagging" aria-hidden="true" ng-if="!connection.isLatencyOkay"></i>',
          '<img src="../img/notwifi.svg" class="offline" alt="" ng-if="!connection.iamOnline">',
          '</li>'
        ].join('');
      },
      link: function(scope, elm, attrs, ctrl) {

        var getInternetStatus = function() {
          $rootScope.connection.iamOnline = false;
          $rootScope.connection.message = 'Você está sem conexão a Internet';
          if (navigator.onLine) {
            $rootScope.connection.iamOnline = true;
            $rootScope.connection.message = 'Você possui conexão com a internet';
          }
        };

        $interval(getInternetStatus, 1000);
      }
    }
  }])
  .directive('apiStatus', function() {
    return {
      restrict: 'E',
      replace: true,
      template: function () {
        return [
          '<div id="showDinno" class="open-status-server" ng-class="{\'opened\': !connection.isApiAccessible}">',
          '<section class="status-server container">',
          '<h3>Você não esta conseguindo se conectar com ao nosso servidor.</h3>',
          '<span>',
          '<h4 ng-show="!connection.showTryFailed">Aguarde, tentaremos reconectar em {{connection.countDown}} segundos...</h4>',
          '</span>',
          '<span ng-show="connection.showTryFailed">',
          '<h4>Nova tentativa falhou, verifique sua conexão com a internet.</h4>',
          '</span>',
          '<div class="loader"></div>',
          '</section>',
          '</div>'
        ].join('');
      }
    }
  });