angular.module('app.controllers', ['ionic'])
  .controller('filaDeVistoriaCtrl',  function($scope, vistoriaServ, $firebaseArray) {
	
	var dateY = new Date();
    dateY.setDate(dateY.getDate());

    vistoriaServ.getCarQueue(dateY).then(function(array){
            $scope.sQueue = array;
            console.log(array);
        });
    
    
})

/*.controller('fotosCtrl', function($scope, vistoriaServ, $cordovaCamera, $cordovaFile, $ionicPopup) {
	console.log('fotosCtrl loaded...')
    var storageRef = firebase.storage().ref();
    
    var showAlert = function(msg, tit) {
       var alertPopup = $ionicPopup.alert({
         title: tit,
         template: msg
       })
    };
    
    //showAlert('Pressione um botao para tirar foto', 'Info');
    
    $scope.takePicture = function (carside) {
        
        try{
            $scope.carside = carside;
            
            var opcionesCaptura = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
            };

            //$cordovaCamera.getPicture(opcionesCaptura)
            //.then(processImage, processError);
            console.log(opcionesCaptura, carside);
            vistoriaServ.takePicture(opcionesCaptura, carside);
            
            }
        catch(exception){
            //vistoriaServ.showAlert(exception.message, 'Failed!');
            console.log("erro no controler: " + exception);
        }
    };
})*/

.controller('fotosCtrl', function($scope, vistoriaServ, $cordovaCamera, $cordovaFile, $ionicPopup) {
	console.log('fotosCtrl loaded...')
    var storageRef = firebase.storage().ref();
    $scope.functionalPath = 'Agendamentos/#year/#month/#day/cliente/#clientkey/vistoria/fotos/#endpoint';
    
    $scope.takePicture = function (carside) {
        
        try{
            $scope.carside = carside;
            
            var opcionesCaptura = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
            };

            $cordovaCamera.getPicture(opcionesCaptura)
                .then(procesarImagen, procesarError);
            }
        catch(exception){
            vistoriaServ.showAlert(exception.message, 'Failed!');
        }
    };

    function procesarImagen(pathImagen) {
        var directorioFuente = pathImagen.substring(0, pathImagen.lastIndexOf('/') + 1),
            archivoFuente = pathImagen.substring(pathImagen.lastIndexOf('/') + 1, pathImagen.length),
            nombreParaGuardar = new Date().valueOf() + archivoFuente;

        $cordovaFile.readAsArrayBuffer(directorioFuente, archivoFuente)
            .then(function (success) {
                var blob = new Blob([success], {type: 'image/jpeg'});
                //enviarFirebase(blob, nombreParaGuardar);
            
                vistoriaServ.addPictureToFirebase(blob, nombreParaGuardar, $scope.functionalPath, $scope.carside).then(function(result){
                    vistoriaServ.showAlert(result, 'Foto enviada!');    
                });
            
            }, function (error) {
                console.error(error);
                vistoriaServ.showAlert(error.message, 'Failed!');
            });
    }

    function procesarError(error) {
        console.error(JSON.stringify(error));
        vistoriaServ.showAlert(error.message, 'Processing Failed!');
    }
})


.controller('vistoriaCtrl', function($scope, vistoriaServ, $firebaseArray, $stateParams) {
	console.log('vistoriaCtrl loaded...');
    
    var queue = vistoriaServ.getCachedQueue();
    $scope.sQueue = queue[$stateParams.objIdx];
    
    console.log("queue object", $scope.sQueue);
    
    console.log("O id é: ", $stateParams.clientid);
    vistoriaServ.setClientKey($stateParams.clientid);
    
    var dateY = new Date();
    dateY.setDate(dateY.getDate()); 
    
    vistoriaServ.setStartTime(dateY);
    
    console.log($scope.sQueue);
    console.log("current user is:", firebase.auth().currentUser);
    
    $scope.next = function(){
        
        console.log("atualizando dados do carro");
        
    }
    
})

.controller('loginCtrl', function($scope, vistoriaServ, $firebaseAuth, $state ) {
	console.log('loginCtrl loaded...')

    
    $scope.login = {};
    $scope.login.user = "ogonella@gmail.com";
    $scope.erro = "";
    
    $scope.logIn = function(){
        console.log($scope.login.user, $scope.login.pass);
        
        vistoriaServ.signIn($scope.login.user, $scope.login.pass).then(function(user){;
        console.log("usuario logado com sucesso", user);
                                                                                      
         $state.go('menu.filaDeVistoria', {}, {reload: true});
                                                                                      
        }).catch(function(error){
            
            $scope.erro = error;
            
        });
    }
})

.controller('opcionaisCtrl', function($scope, vistoriaServ, $firebaseAuth, $state ) {
	console.log('opcionaisCtrl loaded...')
        
        //Current date
       var dateY = new Date();
       dateY.setDate(dateY.getDate()); 
        
        console.log("Data Corrente:", dateY);
    
       vistoriaServ.getCheckupItens( dateY, 'Opcionais').then(function(items){
         console.log("Items da Vistoria:", items); 
         //$scope.checkupItems = [];
           var checkupItems = [];
         
         angular.forEach(items, function(value, key){
             
             //$scope.checkupItems.push({Check: value.Check, Descricao: value.Descricao, id: key});
             checkupItems.push({Check: value.Check, Descricao: value.Descricao, id: key});
         })
         
         //Pre-set items
          vistoriaServ.saveCheckupItens(dateY, 'Opcionais', checkupItems).then(function(){
              
               vistoriaServ.getCheckupItens( dateY, 'Opcionais').then(function(items){
                $scope.checkupItems = items;
             });
              
          }) 
       });
     
      $scope.saveOpcionais = function(){
          //vistoriaServ.saveCheckupItens(dateY, 'Opcionais', $scope.checkupItems);
          $state.go('menu.checklist', {}, {reload: true});
      }
})

.controller('checklistCtrl', function($scope, vistoriaServ, $firebaseAuth, $state ) {
	console.log('checklistCtrl loaded...')
        
        //Current date
       var dateY = new Date();
       dateY.setDate(dateY.getDate()); 
        
        console.log("Data Corrente:", dateY);
    
       vistoriaServ.getCheckupItens( dateY, 'Gerais').then(function(items){
         console.log("Items da Vistoria:", items); 
         var checkupItems = [];
         
         angular.forEach(items, function(value, key){
             
             checkupItems.push({Check: value.Check, Descricao: value.Descricao, id: key});
         })
         
         vistoriaServ.saveCheckupItens(dateY, 'Gerais', checkupItems).then(function(){
             
             vistoriaServ.getCheckupItens( dateY, 'Gerais').then(function(items){
                $scope.checkupItems = items;
             });
             
         });
           
       });
     
      $scope.saveOpcionais = function(){
          //vistoriaServ.saveCheckupItens(dateY, 'Gerais', $scope.checkupItems);
          $state.go('menu.finaliza', {}, {reload: true});
      }
})



.controller('detalharCtrl', function($scope, vistoriaServ, $firebaseAuth, $state, $cordovaCamera, $cordovaFile, $stateParams ) {
	console.log('detalharCtrl loaded...')
        
        //Current date
       var dateY = new Date();
       dateY.setDate(dateY.getDate()); 
    
       $scope.functionalPath = 'Agendamentos/#year/#month/#day/cliente/#clientkey/vistoria/' + $stateParams.tKind + '/' + $stateParams.id + '/#endpoint';
        
    $scope.comment = {text: "este é um teste de descricao"};
    $scope.takePicture = function (endpoint) {
        
        try{
            $scope.endpoint = endpoint;
            
            var opcionesCaptura = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
            };

            $cordovaCamera.getPicture(opcionesCaptura)
                .then(procesarImagen, procesarError);
            }
        catch(exception){
            vistoriaServ.showAlert(exception.message, 'Failed!');
        }
    };

    function procesarImagen(pathImagen) {
        var directorioFuente = pathImagen.substring(0, pathImagen.lastIndexOf('/') + 1),
            archivoFuente = pathImagen.substring(pathImagen.lastIndexOf('/') + 1, pathImagen.length),
            nombreParaGuardar = new Date().valueOf() + archivoFuente;

        $cordovaFile.readAsArrayBuffer(directorioFuente, archivoFuente)
            .then(function (success) {
                var blob = new Blob([success], {type: 'image/jpeg'});
                //enviarFirebase(blob, nombreParaGuardar);
            
                vistoriaServ.addPictureToFirebase(blob, nombreParaGuardar, $scope.functionalPath, $scope.endpoint).then(function(result){
                    vistoriaServ.showAlert(result, 'Foto enviada!');    
                });
            
            }, function (error) {
                console.error(error);
                vistoriaServ.showAlert(error.message, 'Failed!');
            });
    }

    function procesarError(error) {
        console.error(JSON.stringify(error));
        vistoriaServ.showAlert(error.message, 'Processing Failed!');
    }
           
        
   $scope.expandText = function(){
        var element = document.getElementById("txtnotes");
        element.style.height =  element.scrollHeight + "px";
    }
   
   $scope.saveComment = function(){
       console.log("comment.text:", $scope.comment);
       
       vistoriaServ.addDataToFirebase($scope.comment.text, $scope.functionalPath, 'Comentario')
   }
    
})

.controller('finalizaCtrl', function($scope, vistoriaServ, $firebaseAuth, $state ) {
	console.log('finalizaCtrl loaded...')
        
        //Current date
       var dateY = new Date();
       dateY.setDate(dateY.getDate()); 
    
       $scope.totalTime = vistoriaServ.getVistoriaDuration(dateY);
        
       $scope.expandText = function(){
            var element = document.getElementById("txtnotes");
            element.style.height =  element.scrollHeight + "px";
        }
    
})



 