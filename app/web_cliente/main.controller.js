'use strict';

medApp.controller('mainPageCtrl',
    function mainPageCtrl($scope, $rootScope, $location, $rootElement) {
        console.log("mainPageCtrl is in control");
    });


medApp.controller('mainPageCtrl',
                  function mainPageCtrl($scope, $rootScope, $location, $rootElement, fipeServ, agendaServ, $timeout){
    
    agendaServ.getCurrentDateTime().then(function(serverDate){
        
        console.log("Server Date is ", serverDate)
        
    })
    
    $scope.showSpinner = true;
    
    fipeServ.getMarcas().then(
        function(brands){
            $scope.marcas = brands; 
        });
    
    $scope.updateModelos = function(selectedMarca) {
        $scope.showSpinner = true;
        fipeServ.getModels(selectedMarca).then(
            function(models){
                $scope.modelos = models; 
                $scope.anos = null;
                $scope.kms = null;
        });
    };
    
    $scope.updateAnos = function(selectedMarca, selectedModelo) {
        $scope.showSpinner = true;
        fipeServ.getYears(selectedMarca, selectedModelo).then(
            function(years){
                $scope.anos = years;
                $scope.kms = null;
        });
    };
    
    $scope.updateKm = function(selectedMarca, selectedModelo, selectedAno) {
        $scope.showSpinner = true;
        $scope.kms = fipeServ.getKmsDepreciation();
    };
    
    $scope.updateBlindagem = function(selectedMarca, selectedModelo, selectedAno, selectedKm) {
        $scope.showSpinner = true;
        console.log("updateBlindagem Called", selectedKm);
        var faixa = $('#cbKm option:selected').text();
        
      fipeServ.getPriceAndInfo(selectedMarca, selectedModelo, selectedAno, faixa, selectedKm).then(
          function(carData){
                $scope.carInfo = carData;
                console.log(carData);
                $scope.showSpinner = false;
          });
    }
    
    /// Guarantees UI will behave properly after data binding is rendered in Select boxes.
    $scope.$on('ngLoadMarca', function(ngRepeatFinishedEvent) {
        
            $('[name=cbMarca]').val( 0 );
            $('[name=cbModelo]').val( 0 );
            $('[name=cbAno]').val( 0 );
            $('[name=cbKm]').val( 0 ); 
            $scope.showSpinner = false;
    });
     
    
    $scope.$on('ngLoadModelo', function(ngRepeatFinishedEvent) {
        
            $('[name=cbModelo]').val( 0 );
            $('[name=cbAno]').val( 0 );
            $('[name=cbKm]').val( 0 );
            $scope.showSpinner = false;
    });
    
    $scope.$on('ngLoadAno', function(ngRepeatFinishedEvent) {
        
            $('[name=cbAno]').val( 0 );
            $('[name=cbKm]').val( 0 );
            $scope.showSpinner = false;
    });
    
     $scope.$on('ngLoadKm', function(ngRepeatFinishedEvent) {
        
            $('[name=cbKm]').val( 0 );
            $scope.showSpinner = false;
    });
    ///
    
    $scope.go = function (newRoute){
        
        //Do all validation
        $location.path(newRoute);
    }
    
});


medApp.controller('step1Ctrl',
                  function step1Ctrl($scope, $rootScope, $location, $rootElement, agendaServ, fipeServ) {
    
    $scope.saveClient = function (nome, email, tel, cep){
        
        var carData = fipeServ.getAvaliacaoCorrente();
        console.log("Os dados do carro seguem: ", carData);
        
        agendaServ.saveClient(nome, email, tel, cep, carData).then(function(clientData){
            console.log("Client Data Logged:", clientData);
        });
        
        
        go('/step2');
        
    };
    
    var go = function (newRoute){
        
        //Do all validation
        $location.path(newRoute);
    }

});

medApp.controller('step2Ctrl',
                  function step1Ctrl($scope, $rootScope, $location, $rootElement, agendaServ, fipeServ) {
 
    var carData = fipeServ.getAvaliacaoCorrente();
    var valorMin =  accounting.unformat(carData.precoMin, ",");
    var valorMax =  accounting.unformat(carData.precoMax, ",");
    
    $scope.valorMin = parseFloat(valorMin/1000).toFixed(1);
    $scope.valorMax =  parseFloat(valorMax/1000).toFixed(1);
    
    $scope.go = function (newRoute){
        
        //Do all validation
        $location.path(newRoute);
    }
            
});

medApp.controller('step3Ctrl',
                  function step3Ctrl($scope, $rootScope, $location, $rootElement, agendaServ, fipeServ) {
 
    var clientData;
    //Testing Data for Step3 Time Scheduler ////////////////////////////////////////////////////////////////////////////////
    console.log("Calling Save Client...");
    
    /*agendaServ.saveClient("Marcelo Gonella", "ogonella@chevron.com", "(021) 98127-0378", "22795-006", 
                                           {
                                                 AnoModelo: 
                                                2016,
                                                 CodigoFipe: 
                                                "009208-8  ",
                                                 Combustivel: 
                                                "Gasolina",
                                                 Marca: 
                                                "BMW",
                                                 MesReferencia: 
                                                "julho de 2016",
                                                 Modelo: 
                                                "225i Active Tourer Sport 2.0 TB Aut.",
                                                 SiglaCombustivel: 
                                                "G",
                                                 TipoVeiculo: 
                                                1,
                                                 Valor: 
                                                "R$ 157.458,00",
                                                 km: 
                                                "20.001 a 30.000",
                                                 precoMax: 
                                                "R$ 141.712,20",
                                                 precoMin: 
                                                "R$122.817,24"
                                                }).then(function(cliData){ console.info("Client Test Data Saved", cliData); clientData = cliData;})
    //End of test data setup ////////////////////////////////////////////////////////////////////////////////////////////////
    */
    
    agendaServ.getAvailableDates().then(function(sDates){
        
        $scope.sDates = sDates;
        console.log("Dates Available", $scope.sDates)
        
    });
    
    
    //Descomentar na versão de produção
    clientData = agendaServ.getCurrentClientData();
        
    console.log("__________________________________________");
    console.log(clientData);
    console.log("__________________________________________");
    
    
    $scope.Agendar = function(sDate, sTime){
       console.log("Agendar para:", sDate, sTime);
       agendaServ.saveAgenda(sDate, sTime, clientData ).then(function(total){
         
           go('/confirma');
           
       })
    }
    
    $scope.CarregaHorarios = function(sDate){
        console.log("Carregar Horarios chamada para ", sDate);
        $scope.sTimes = agendaServ.getAvailableTimes();
    }
    
    var go = function (newRoute){
        
        //Do all validation
        $location.path(newRoute);
    }
            
});

medApp.controller('confirmaCtrl',
                  function confirmaCtrl($scope, $rootScope, $location, $rootElement, agendaServ, fipeServ) {

    $scope.agenda = agendaServ.getCurrentScheduled();

});

