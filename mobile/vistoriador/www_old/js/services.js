angular.module('app.services', ['firebase'])
  .factory('vistoriaServ', ['$q', '$http', '$firebaseObject', '$firebaseArray', '$firebaseAuth', '$ionicPopup',
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
        addPictureToFirebase: addPictureToFirebase
    };

    console.log("vistoriaServ.js service loaded");
        
    var queue ;
    var auth;
    var user;
    var clientKey;
    
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
    
   function saveCheckupItens(sDate, category, list)   {
        
       var dateObj = stripDate(sDate);
       
       console.log("OBJ Original:", list);
       
       firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente/' + clientKey +'/vistoria/' + category).set(angular.copy(list));
              
   } 
       
   function signOut(){
       
       firebase.auth().signOut().then(function() {
        console.log("Usuario deu logoff")
       }, function(error) {
        console.log("Erro ao dar logoff:", error.message);
       })
   }
   
    function getAuthUser(){
        
        return user;
        
    }
    
    function setClientKey(key){
        
        clientKey = key;
    }
       
    function getClientKey(){
        
        return clientKey;
    }
       
    function getCheckupItens(sDate, itemCategory){
        
        
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
       
    //Need to get date in localtime and will convert to UTC
    function stripDate(date){

        var utcDate = new Date(0);
        utcDate.setUTCSeconds(date/1000);

        var dd = utcDate.getDate();
        var mm = utcDate.getMonth()+1;
        var yyyy = utcDate.getFullYear();
        if(dd<10) {dd='0'+dd}
        if(mm<10) {mm='0'+mm}

        return {date: date, utcDate: utcDate, day: dd, month: mm, year: yyyy, code: yyyy+mm+dd}

    }
       
    function addPictureToFirebase(file, fileName, location)
   {
        var def = $q.defer();
                            
        var uploadTask = firebase.storage().ref().child('images/' + fileName).put(file);
        var dateObj = getCurrentDate();
                            
        uploadTask.on('state_changed', function (snapshot) {
            console.info(snapshot);
        }, function (error) {
            console.error(error);
            showAlert(error.message, 'Failed!');
        }, function () {
            var downloadURL = uploadTask.snapshot.downloadURL;
            console.log(downloadURL);
            
            firebase.database().ref().child('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente/' + clientKey +'/vistoria/fotos/' + location).set(downloadURL);                
            def.resolve(downloadURL);
            
            //showAlert(downloadURL, 'Success!');
        });
        
        return def.promise;
       

   }
                            
   function getCurrentDate(){
        var dateY = new Date();
        dateY.setDate(dateY.getDate());                    
        var dateObj = stripDate(dateY);
                            
        return dateObj;
    }
                            
   function showAlert (msg, tit) {
       var alertPopup = $ionicPopup.alert({
         title: tit,
         template: msg
       })
    };
                            
}])






