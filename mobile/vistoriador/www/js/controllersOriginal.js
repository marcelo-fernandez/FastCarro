angular.module('app.controllers', [])
  .controller('filaDeVistoriaCtrl',  function($scope, vistoriaServ, $firebaseArray) {
	
	var dateY = new Date();
    dateY.setDate(dateY.getDate());

    vistoriaServ.getCarQueue(dateY).then(function(array){
            $scope.sQueue = array;
            console.log(array);
        });
    
    
})

.controller('fotosCtrl', function($scope, vistoriaServ, $cordovaCamera) {
	console.log('fotosCtrl loaded...')
    
    $scope.takePicture = function() {
        var options = { 
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        
        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            alert(err);
        });
    }
    
    //Funcao abaixo pega o Path e nao o conteudo base64
        /*resizeImage: function (img_path) {
            var q = $q.defer();
            window.imageResizer.resizeImage(function (success_resp) {
                console.log('success, img re-size: ' + JSON.stringify(success_resp));
                q.resolve(success_resp);
            }, function (fail_resp) {
                console.log('fail, img re-size: ' + JSON.stringify(fail_resp));
                q.reject(fail_resp);
            }, img_path, 200, 0, {
                imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                resizeType: ImageResizer.RESIZE_TYPE_MIN_PIXEL,
                pixelDensity: true,
                storeImage: false,
                photoAlbum: false,
                format: 'jpg'
            });

            return q.promise;
        }
*/
        
	
    $scope.upload = function()
    {
        // Create a root reference
        var storageRef = firebase.storage().ref();

        // Create a reference to 'vistorias/frente.jpg'
        var mountainImagesRef = storageRef.child('vistorias/frente.jpg');
        
        var file = 'img/Steps.jpg';
        

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



 