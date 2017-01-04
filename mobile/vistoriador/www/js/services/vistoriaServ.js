//SERVICE:      Vistoria
//DESCRIPTION:  Wrapper Service for Firebase Authentication
//Revealing Pattern implemented with IFEE (to create some scope)
//
(function () {

    function vistoriaServ($q, $http, $firebaseObject, $firebaseArray, utilServ) {
        console.log("vistoriaServ.js service loaded");
        
        function registerCar(key, car, sDate)
        {
            console.log("Key to update:", key);
            
            var strippedDate = utilServ.stripDate(sDate)
            
            car.prontoParaVistoria = "sim";
            car.horaDaEntrada = strippedDate.utcDate.toTimeString();
            
            firebase.database().ref('/Agendamentos/' + strippedDate.year + '/' + strippedDate.month + '/' + strippedDate.day + '/cliente/' + key + '/carro' ).set(car);
        }
        
        function getCarQueue(sDate)
        {
            console.log("Lendo a lista de carros na fila de vistoria...:", key);
            
            var dateObj = utilServ.stripDate(sDate)
            
            var def = $q.defer();
            
            console.log('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente');
            var ref = firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente').orderByChild("dados/HoraCode");
            
            var syncArray = $firebaseArray(ref);        
                
            syncArray.$loaded().then(function(array){
                
                def.resolve(array);
                
            });
                                     
            return def.promise;
        }
        
        function saveCarData(owner, brand, model, km, modelYear, factoryYear, plate, renavam)
        {
            //var ref = 
            console.log("inside function: Km = ", km);
            console.log("inside function: plate = ", plate);
            console.log("inside function: renavam = ", renavam);
            
        }
        
        //Expose the public API methods - https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/59/modelos/5940/anos/2014-3
        return {
            registerCar: registerCar,
            getCarQueue: getCarQueue
        };
        
        
    };

    //Get a reference of medApp Module
    var app = angular.module('app');

    //Register the service
    app.factory('vistoriaServ', vistoriaServ);

}());
