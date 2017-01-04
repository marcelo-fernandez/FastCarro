angular.module('app.services', ['firebase','ionic'])
  .factory('leilaoServ', ['$q', '$http', '$firebaseObject', '$firebaseArray', '$firebaseAuth', '$ionicPopup', '$cordovaCamera', '$cordovaFile',
   function($q, $http, $firebaseObject, $firebaseArray, $firebaseAuth, $ionicPopup){
    
    //Expose the public API methods
    return {
        getCarQueue: getCarQueue,
        getCachedQueue: getCachedQueue,
        signIn: signIn,
        setClientKey: setClientKey,
        getClientKey: getClientKey,
        showAlert: showAlert,
        setStartTime: setStartTime,
        getMinutesBetweenDates: getMinutesBetweenDates
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
    

    function setStartTime(sDate)
    {
        vistoriaStartTime = sDate;
    }
    
       

                              
}])






