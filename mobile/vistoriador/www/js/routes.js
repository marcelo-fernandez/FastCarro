angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

    .state('menu.filaDeVistoria', {
    url: '/home',
    views: {
      'side-menu21': {
        templateUrl: 'templates/filaDeVistoria.html',
        controller: 'filaDeVistoriaCtrl'
      }
    }
  })

  .state('menu.fotos', {
    url: '/fotos',
    views: {
        'side-menu21':{
           templateUrl: 'templates/fotos.html',
           controller: 'fotosCtrl'    
        }
    }  
    
  })

  .state('menu.vistoria', {
    url: '/vistoria/:objIdx?clientid',
    views: {
      'side-menu21': {
        templateUrl: 'templates/vistoria.html',
        controller: 'vistoriaCtrl'
      }
    }
  })
  
  .state('menu.opcionais', {
    url: '/opcionais',
    views: {
      'side-menu21': {
        templateUrl: 'templates/opcionais.html',
        controller: 'opcionaisCtrl'
      }
    }
  })
  
  .state('menu.checklist', {
    url: '/checklist',
    views: {
      'side-menu21': {
        templateUrl: 'templates/checklist.html',
        controller: 'checklistCtrl'
      }
    }
  })
  
  .state('menu.finaliza', {
    url: '/finaliza',
    views: {
      'side-menu21': {
        templateUrl: 'templates/finaliza.html',
        controller: 'finalizaCtrl'
      }
    }
  })

  .state('menu.detalhar', {
    url: '/detalhar/:tKind?id',
    views: {
      'side-menu21': {
        templateUrl: 'templates/detalhe.html',
        controller: 'detalharCtrl'
      }
    }
  }) 
  
  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    abstract:true
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

$urlRouterProvider.otherwise('/login')

  

});