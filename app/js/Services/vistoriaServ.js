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
        
        
        
        //Expose the public API methods - https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/59/modelos/5940/anos/2014-3
        return {
            registerCar: registerCar
        };
        
        
    };

    //Get a reference of medApp Module
    var medApp = angular.module('Zeroclube');

    //Register the service
    medApp.factory('vistoriaServ', vistoriaServ);

}());
