angular.module('app.services', ['firebase','ionic'])
  .factory('vistoriaServ', ['$q', '$http', '$firebaseObject', '$firebaseArray', '$firebaseAuth', '$ionicPopup', '$cordovaCamera', '$cordovaFile',
   function($q, $http, $firebaseObject, $firebaseArray, $firebaseAuth, $ionicPopup){
    
    //Expose the public API methods
    return {
        getCarQueue: getCarQueue,
        getCachedQueue: getCachedQueue,
        signIn: signIn,
        saveCheckupItens:saveCheckupItens,
        setClientKey: setClientKey,
        getClientKey: getClientKey,
        getCheckupItens: getCheckupItens,
        showAlert: showAlert,
        addPictureToFirebase: addPictureToFirebase,
        setStartTime: setStartTime,
        getMinutesBetweenDates: getMinutesBetweenDates,
        getVistoriaDuration: getVistoriaDuration,
        addDataToFirebase:addDataToFirebase,
        saveCarData: saveCarData

    };

    console.log("vistoriaServ.js service loaded");
        
    var queue;
    var auth;
    var user;/**/
    var clientKey;
    var vistoriaStartTime;
    var pictureFullPathFB;
    
   function getCarQueue(sDate)
   {
        console.log("Lendo a lista de carros na fila de vistoria...");

        var dateObj = stripDate(sDate)

        var def = $q.defer();

        console.log('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente');
        
        //var ref = new Firebase('https://fastcarros-d5172.firebaseio.com/Agendamentos/' + dateObj.year + '/' + //dateObj.month + '/' + dateObj.day + '/cliente');
        
        var ref = firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente').orderByChild("dados/HoraCode");
            
        var syncArray = $firebaseArray(ref);         

        syncArray.$loaded().then(function(array){
            queue = array;
            def.resolve(array);

        });

        return def.promise;
    }
    
   function getCachedQueue()
   {
       console.log("Queue cached is: ", queue)
       return queue;
   }
       
   function signIn(email, password)
   {
        var def = $q.defer();
       
        auth = $firebaseAuth();
       
        auth.$signInWithEmailAndPassword(email,password).then(function(firebaseUser) {
        
            user = firebaseUser;
            console.log("User logged in:", user);
            def.resolve(user);;
                            
        }).catch(function(error){
                
            console.log("error message", error);
            def.reject("Usuario ou Senha Invalidos");
            })
        
        return def.promise;

    }
    
   function saveCheckupItens(sDate, category, list)   
   {
        
       var def = $q.defer();
        
       var dateObj = stripDate(sDate);
       
       console.log("OBJ Original:", list);
       
       firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente/' + clientKey +'/vistoria/' + category).set(angular.copy(list)).then(function(){
           
           def.resolve("ok");
       });
       
       return def.promise;
   } 
       
   function signOut()
   {
       
       firebase.auth().signOut().then(function() {
        console.log("Usuario deu logoff")
       }, function(error) {
        console.log("Erro ao dar logoff:", error.message);
       })
   }
   
    function getAuthUser()
    {
        
        return user;
        
    }
    
    function setClientKey(key)
    {
        
        clientKey = key;
    }
       
    function getClientKey()
    {
        
        return clientKey;
    }
       
    function getCheckupItens(sDate, itemCategory)
    {
        var def = $q.defer();

        dateObj = stripDate(sDate);
        
        console.log('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente/' + clientKey + '/vistoria/'+ itemCategory);
        
        //Check if the selected car already has a Vistoria in place. If so read from it, if not, read from template for first time.
        var refControle = firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente/' + clientKey + '/vistoria/'+ itemCategory );
            
            refControle.once("value", function(snapshot) {
                if (!snapshot.exists())
                {
                    console.log("Detectada vistoria nova iniciando")
                    var ref = firebase.database().ref('ItensVistoria/'+itemCategory);
                    var syncArray = $firebaseArray(ref);         

                    syncArray.$loaded().then(function(array){
                    def.resolve(array);
                    })
                }
                else
                {
                    console.log("Vistoria pre-existente detectada, ", snapshot);
                    var syncArray = $firebaseArray(refControle);
                    
                    syncArray.$loaded().then(function(array){
                    def.resolve(array);

                    })
                }
            });
        
        return def.promise;   
    }
    
    function saveCarData(sDate, owner, brand, model, km, modelYear, factoryYear, plate, renavam)
        {
            dateObj = stripDate(sDate);
            console.log("inside function: Km = ", km);
            console.log("inside function: plate = ", plate);
            console.log("inside function: renavam = ", renavam);
            
            var refControle = firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente/' + clientKey);
            
            //Starting setting the data
            refControle.child("dados").child("Nome").set(owner);
            refControle.child("carro").child("Marca").set(brand);
            refControle.child("carro").child("Modelo").set(model);
            refControle.child("carro").child("KmReal").set(km);
            refControle.child("carro").child("AnoModelo").set(modelYear);
            refControle.child("carro").child("FabModelo").set(factoryYear);
            refControle.child("carro").child("placa").set(plate);
            refControle.child("carro").child("renavam").set(renavam);
            
        }  
       
    //Need to get date in localtime and will convert to UTC
    function stripDate(date)
    {

        var utcDate = new Date(0);
        utcDate.setUTCSeconds(date/1000);

        var dd = utcDate.getDate();
        var mm = utcDate.getMonth()+1;
        var yyyy = utcDate.getFullYear();
        if(dd<10) {dd='0'+dd}
        if(mm<10) {mm='0'+mm}

        return {date: date, utcDate: utcDate, day: dd, month: mm, year: yyyy, code: yyyy+mm+dd}

    }
       
    function addPictureToFirebase(file, fileName, functionalPath, location)
    {
        var def = $q.defer();
                            
        var uploadTask = firebase.storage().ref().child('images/' + fileName).put(file);
        var dateObj = getCurrentDate();
        
        var fPath = functionalPath
                .replace('#year', dateObj.year)
                .replace('#month', dateObj.month)
                .replace('#day', dateObj.day)
                .replace('#clientkey', clientKey)
                .replace('#endpoint', location);

        uploadTask.on('state_changed', function (snapshot) {
            console.info(snapshot);
        }, function (error) {
            console.error(error);
            showAlert(error.message, 'Failed!');
        }, function () {
            var downloadURL = uploadTask.snapshot.downloadURL;
            console.log(downloadURL);
           
            firebase.database().ref().child(fPath).set(downloadURL);   
            
            def.resolve(downloadURL);
        });
        
        return def.promise;
    }
    
    function addDataToFirebase(comment, functionalPath, location){
        
        var fPath = functionalPath
                .replace('#year', dateObj.year)
                .replace('#month', dateObj.month)
                .replace('#day', dateObj.day)
                .replace('#clientkey', clientKey)
                .replace('#endpoint', location);
        
        firebase.database().ref().child(fPath).set(comment);
    }
                            
    function getCurrentDate()
    {
        var dateY = new Date();
        dateY.setDate(dateY.getDate());                    
        var dateObj = stripDate(dateY);
                            
        return dateObj;
    }
                            
    function showAlert (msg, tit) 
    {
       var alertPopup = $ionicPopup.alert({
         title: tit,
         template: msg
       })
    }
    
    function getMinutesBetweenDates(startDate, endDate) 
    {
        var diff = endDate.getTime() - startDate.getTime();
        return Math.round(diff / 60000);
    }
    
    function getVistoriaDuration(sDate)
    {
        
        return getMinutesBetweenDates(vistoriaStartTime, sDate);
    }
    
    function setStartTime(sDate)
    {
        vistoriaStartTime = sDate;
    }
    
       
/*    function takePicture(opt, carside){
        console.log("serv.takePicture Carside = ", carside);
        pictureFullPathFB = carside;
        
        function processImage(pathImagen) {
            var directorioFuente = pathImagen.substring(0, pathImagen.lastIndexOf('/') + 1),
                archivoFuente = pathImagen.substring(pathImagen.lastIndexOf('/') + 1, pathImagen.length),
                nombreParaGuardar = new Date().valueOf() + archivoFuente;

            $cordovaFile.readAsArrayBuffer(directorioFuente, archivoFuente)
                .then(function (success) {
                    var blob = new Blob([success], {type: 'image/jpeg'});
                    //enviarFirebase(blob, nombreParaGuardar);

                    addPictureToFirebase(blob, nombreParaGuardar, pictureFullPathFB).then(function(result){
                        showAlert(result, 'Foto enviada!');    
                    });

                }, function (error) {
                    console.error(error);
                    showAlert(error.message, 'Failed!');
                });
            }

        function processError(error) {
            console.error(JSON.stringify(error));
        }
        
        $cordovaCamera.getPicture(opt)
                .then(processImage, processError);
    
    }*/
                              
}])






