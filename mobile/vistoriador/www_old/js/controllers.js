angular.module('app.controllers', ['ionic'])
  .controller('filaDeVistoriaCtrl',  function($scope, vistoriaServ, $firebaseArray) {
	
	var dateY = new Date();
    dateY.setDate(dateY.getDate());

    vistoriaServ.getCarQueue(dateY).then(function(array){
            $scope.sQueue = array;
            console.log(array);
        });
    
    
})

.controller('fotosCtrl', function($scope, vistoriaServ, $cordovaCamera, $cordovaFile, $ionicPopup) {
	console.log('fotosCtrl loaded...')
    var storageRef = firebase.storage().ref();
    
    /*var showAlert = function(msg, tit) {
       var alertPopup = $ionicPopup.alert({
         title: tit,
         template: msg
       })
    };*/
    
    //showAlert('Pressione um botao para tirar foto', 'Info');
    
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
            
                vistoriaServ.addPictureToFirebase(blob, nombreParaGuardar, $scope.carside).then(function(result){
                    vistoriaServ.showAlert(result, 'Foto enviada!');    
                });
            
            }, function (error) {
                console.error(error);
                vistoriaServ.showAlert(error.message, 'Failed!');
            });
    }
    
    
    
    
    /*function enviarFirebase(file, nombre) {
        var storageRef = firebase.storage().ref();
        var uploadTask = storageRef.child('images/' + nombre).put(file);
        uploadTask.on('state_changed', function (snapshot) {
            console.info(snapshot);
        }, function (error) {
            console.error(error);
            showAlert(error.message, 'Failed!');
        }, function () {
            var downloadURL = uploadTask.snapshot.downloadURL;
            console.log(downloadURL);
            
            
            
            showAlert(downloadURL, 'Success!');
        });
    }*/

    function procesarError(error) {
        console.error(JSON.stringify(error));
    }
})

.controller('vistoriaCtrl', function($scope, vistoriaServ, $firebaseArray, $stateParams) {
	console.log('vistoriaCtrl loaded...');
    
    var queue = vistoriaServ.getCachedQueue();
    $scope.sQueue = queue[$stateParams.objIdx];
    
    console.log("O id deste infeliz é: ", $stateParams.clientid )
    vistoriaServ.setClientKey($stateParams.clientid);
    
    console.log($scope.sQueue);
    console.log("current user is:", firebase.auth().currentUser)
    
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
         $scope.checkupItems = [];
         
         angular.forEach(items, function(value, key){
             
             $scope.checkupItems.push({Check: value.Check, Descricao: value.Descricao});
         })        
       });
     
      $scope.saveOpcionais = function(){
          vistoriaServ.saveCheckupItens(dateY, 'Opcionais', $scope.checkupItems);
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
         $scope.checkupItems = [];
         
         angular.forEach(items, function(value, key){
             
             $scope.checkupItems.push({Check: value.Check, Descricao: value.Descricao});
         })        
       });
     
      $scope.saveOpcionais = function(){
          vistoriaServ.saveCheckupItens(dateY, 'Gerais', $scope.checkupItems);
      }
})



.controller('detalharCtrl', function($scope, vistoriaServ, $firebaseAuth, $state ) {
	console.log('detalharCtrl loaded...')
        
        //Current date
       var dateY = new Date();
       dateY.setDate(dateY.getDate()); 
        
       $scope.expandText = function(){
            var element = document.getElementById("txtnotes");
            element.style.height =  element.scrollHeight + "px";
        }
    
})



 