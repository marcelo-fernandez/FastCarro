angular.module('app.controllers', ['ionic'])
  .controller('emLeilOCtrl',  function($scope, $firebaseArray) {
	
	var dateY = new Date();
    dateY.setDate(dateY.getDate());

    console.log("LeilaoController Called...");
    
    
})

.controller('menuCtrl',  function($scope, $firebaseArray) {
	
	var dateY = new Date();
    dateY.setDate(dateY.getDate());

    console.log("MenuController Called...");
    
    
})

.controller('lancesCtrl',  function($scope, $firebaseArray) {
	
	var dateY = new Date();
    dateY.setDate(dateY.getDate());

    console.log("lancesCtrl Called...");
    
    
})

.controller('minhasComprasCtrl',  function($scope, $firebaseArray) {
	
	var dateY = new Date();
    dateY.setDate(dateY.getDate());

    console.log("lancesCtrl Called...");
    
    
})

.controller('loginCtrl',  function($scope, leilaoServ, $firebaseAuth, $state) {
	
$scope.login = {};
    $scope.login.user = "ogonella@gmail.com";
    $scope.erro = "";
    
    $scope.logIn = function(){
        console.log($scope.login.user, $scope.login.pass);
        
        leilaoServ.signIn($scope.login.user, $scope.login.pass).then(function(user){;
        console.log("usuario logado com sucesso", user);
                                                                                      
         $state.go('tabsController.emLeilO', {}, {reload: true});
                                                                                      
        }).catch(function(error){
            
            $scope.erro = error;
            
        });
    }
    
    
})