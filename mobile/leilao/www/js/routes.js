angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
 .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('tabsController.emLeilO', {
    url: '/leilao',
    views: {
      'tab1': {
        templateUrl: 'templates/emLeilO.html',
        controller: 'emLeilOCtrl'
      }
    }
  })

  .state('tabsController.lances', {
    url: '/lances',
    views: {
      'tab2': {
        templateUrl: 'templates/lances.html',
        controller: 'lancesCtrl'
      }
    }
  })

  .state('tabsController.minhasCompras', {
    url: '/compras',
    views: {
      'tab3': {
        templateUrl: 'templates/minhasCompras.html',
        controller: 'minhasComprasCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/login')

  

});