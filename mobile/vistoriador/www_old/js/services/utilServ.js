//SERVICE:      Agendamento
//DESCRIPTION:  Wrapper Service for Firebase Authentication
//Revealing Pattern implemented with IFEE (to create some scope)
//
(function () {

    function utilServ($q, $http, $firebaseObject, $firebaseArray) {
        console.log("utilServ.js service loaded");
        
        var clienteData;
        var carroData;
        var carrosPorHorario = 2;
        var diaAgenda;
        var horaAgenda;
    
        function getCurrentDateTime(){
            var def = $q.defer();
             
            firebase.database().ref("/.info/serverTimeOffset").on('value', function(offset) {
                    var offsetVal = offset.val() || 0;
                    var serverTime = (Date.now() + offsetVal)/1000;
                    var utcDate = new Date(0);
                    utcDate.setUTCSeconds(serverTime);
                    
                    //var dateOnly = utcDate.getFullYear().toString() + (utcDate.getMonth()+1).toString() + utcDate.getDate().toString();
                    var yearPart = utcDate.getFullYear().toString();
                
                    var months = new Array("Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro");
                    
                    var monthPart;
                
                    if((utcDate.getMonth()+1) <10){
                        monthPart = "0"+(utcDate.getMonth()+1).toString(); 
                    }
                    else{
                        monthPart = (utcDate.getMonth()+1).toString();
                    }
                    
                    var dayPart ;
                    
                    if (utcDate.getDate() < 10){
                        dayPart = "0" + utcDate.getDate().toString();
                    } else {
                        dayPart = utcDate.getDate();
                    }

                    var dateOnly = yearPart + monthPart + dayPart; 
                    
                    var currentDate = {utcDate: utcDate, year: yearPart, monthPart: monthPart, dayPart: dayPart, monthLiteral: months[utcDate.getMonth()], dateCode: dateOnly  }
                     console.info("Current Date Object", currentDate)
                    
                    def.resolve(currentDate);
            });
            
            return def.promise;
        }
        
        
        
        //Need to get date in UTC format
        function formatDate(date){

            var dd = date.getDate();
            var mm = date.getMonth()+1;
            var yyyy = date.getFullYear();
            if(dd<10) {dd='0'+dd}
            if(mm<10) {mm='0'+mm}
            var label = +dd.toString()+'-'+mm.toString()+'-'+yyyy.toString(); 
            var key = yyyy.toString() +mm.toString()+dd.toString(); 
            date = +mm+'/'+dd+'/'+yyyy;
            
            return {key: key, label: label};
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
        
        
        
        //Expose the public API methods - https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/59/modelos/5940/anos/2014-3
        return {
            getCurrentDateTime: getCurrentDateTime,
            stripDate: stripDate
            
        };
    };

    //Get a reference of medApp Module
    var app = angular.module('app');

    //Register the service
    app.factory('utilServ', utilServ);

}());
