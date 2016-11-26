//SERVICE:      Precificação de veículo usado 
//DESCRIPTION:  Basea-se na tabela FIPE e aplica fatores de acordo com as características do veículo. 
//Revealing Pattern implemented with IFEE (to create scope)
//
(function () {

    var fipeServ = function ( $q, $http) {
        console.log("fipeServ.js service loaded");

        var marcas=[];
        var carroData; 
        
        function getAvaliacaoCorrente(){
        
            if (carroData){
                return carroData;
            }
            else{
                return null;
            }
        }
        
        function getMarcas() {
            console.log("GetMarcas called");
            var def = $q.defer();

            $http({
                url: 'https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas',
                method: 'GET'
            })
            .success(function (data){
                marcas = data;
                
                console.log(data);
                def.resolve(data);
            })
            .error(function(){
                def.reject("Não foi possivel obter lista de marcas");
            })
            
            return def.promise;
        }
        
        function getModels(marcaID){
            console.log("GetModels called");
            var def = $q.defer();

            $http({
                url: 'https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/' + marcaID + '/modelos',
                method: 'GET'
            })
            .success(function (data){
                console.log(data);
                def.resolve(data);
            })
            .error(function(){
                def.reject("Não foi possivel obter lista de modelos");
            })
            
            return def.promise;
        }
        
        function getYears(marcaID, modelID){
            console.log("GetModels called");
            var def = $q.defer();

            $http({
                url: 'https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/'+ marcaID +'/modelos/'+ modelID +'/anos',
                method: 'GET'
            })
            .success(function (data){
                console.log(data);
                def.resolve(data);
            })
            .error(function(){
                def.reject("Não foi possivel obter lista de Anos");
            })
            
            return def.promise;
        }
        
        function getPriceAndInfo(marcaID, modelID, yearID, km, discount){
            console.log("getPriceAndInfo called:");
            console.log(marcaID, modelID, yearID)
            var def = $q.defer();

            $http({
                url: 'https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/'+ marcaID +'/modelos/'+ modelID +'/anos/' + yearID,
                method: 'GET'
            })
            .success(function (data){
                
                var preco = accounting.unformat(data.Valor, ",");
                
                var precoMin = accounting.formatMoney(preco - (preco*20/100) - (preco*discount), "R$",2, ".", ",");
                var precoMax = accounting.formatMoney(preco - (preco*10/100), "R$ ",2, ".", ",");

                data.precoMin = precoMin;
                data.precoMax = precoMax;
                data.km = km;
                data.renavam = '';
                data.placa = '';
                
                console.log(km);
                carroData = data;
                
                def.resolve(data);
            })
            .error(function(){
                def.reject("Não foi possivel obter lista de Anos");
            })
            
            return def.promise;
        }
        
        function getKmsDepreciation(){
            
               var kms = [{
                        faixa: '0 a 20.000',
                        desconto: 0.01
                      },
                      {
                        faixa: '20.001 a 30.000',
                        desconto: 0.02
                      },
                      {
                        faixa: '30.001 a 40.000',
                        desconto: 0.03
                      },
                      {
                        faixa: '40.001 a 50.000',
                        desconto: 0.04
                      },
                      {
                        faixa: '50.001 a 60.000',
                        desconto: 0.05
                      },
                      {
                        faixa: '60.001 a 70.000',
                        desconto: 0.06
                      },
                      {
                        faixa: '70.001 a 80.000',
                        desconto: 0.07
                      },
                      {
                        faixa: '80.001 a 90.000',
                        desconto: 0.08
                      },
                      {
                        faixa: '90.001 a 100.000',
                        desconto: 0.09
                      },
                      {
                        faixa: 'acima de 100.000',
                        desconto: 0.10
                      }] 
               
               return kms;
                        
        }
        
    
        //Expose the public API methods - https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/59/modelos/5940/anos/2014-3
        return {
            getMarcas: getMarcas,
            getModels: getModels,
            getYears: getYears,
            getPriceAndInfo: getPriceAndInfo,
            getKmsDepreciation: getKmsDepreciation,
            getAvaliacaoCorrente: getAvaliacaoCorrente
        };
    };

    //Get a reference of medApp Module
    var medApp = angular.module('Zeroclube');

    //Register the service
    medApp.factory('fipeServ', fipeServ);

}());
