'use strict';

medApp.controller('adminCtrl',
    function adminCtrl($scope, $rootScope, $location, $rootElement, $interval, agendaServ, vistoriaServ, $firebaseArray) {
        console.log("adminCtrl is in control");
        
//Handling Vistoria Portlet Functions ////////////////////////////////////////////////           
    
        $scope.selectTab = function (tab) {
            switch (tab) {
            case 'agoraTab':
                $scope.partialFile = 'web_admin/admin.vistoria.html';
                $("#agoraTab").addClass("active");
                $("#hojeTab").removeClass("active");
                $("#ontemTab").removeClass("active");
                startSim();
                break;
            case 'ontemTab':
                $scope.partialFile = 'web_admin/profile.myfriends.html';
                $("#ontemTab").addClass("active");
                $("#hojeTab").removeClass("active");
                $("#agoraTab").removeClass("active");
                break;
            case 'hojeTab':
                $scope.partialFile = 'web_admin/profile.myfriends.html';
                $("#hojeTab").addClass("active");
                $("#ontemTab").removeClass("active");
                $("#agoraTab").removeClass("active");
                break;
            }
        }

        $scope.selectTab('agoraTab');
    
    ///SUMULATION//////////////////////////////////////////////////////////////
        var promise; 
    
        function startSim() {
            var i = 1;
            promise = $interval(function(){
                
                i = i * 1.33;
                
                if (i> 100){
                    i=100;
                    $scope.percent = Math.round(i);
                    $interval.cancel(promise);
                }
                else{
                    $scope.percent = Math.round(i);
                }
                
                console.log("Progress %:", Math.round(i));
                
            }, 1000);  
        }
    
    ////////////////////////////////////////////////////////////////////////////////
    
    //Handling Controle de Fila Portlet Functions //////////////////////////////////
    
    $scope.partialFileFila = 'web_admin/admin.fila.html'
    
    var dateY = new Date();
    dateY.setDate(dateY.getDate());
    
    agendaServ.getScheduledCars(dateY).then(function(array){
        console.log("Carros agendados carregados...")
        console.log(array);
        
        $scope.scheduledCars = array;
    
    });
    
    var tkey;
    $scope.ModalCarEntry = function(key, carro, dados){
        
        $scope.partialModal = 'web_admin/admin.modal.entradaCarro.html';
        $scope.modalTitle = "Entrada de Veiculo";
        tkey = key;
        
        $('#admModal').modal('show');
        
        $scope.currentCar = carro;
        $scope.currentClient = dados;
        
        console.log("Carro Selecionado", $scope.currentCar);

    };
    
    $scope.SaveEntry= function (){
        
        console.log("Carro a ser Salvo", $scope.currentCar);
        vistoriaServ.registerCar(tkey, $scope.currentCar, dateY);
        //$('#'+tkey).removeClass('danger');
        //$('#'+tkey).addClass('success');        
    }
    
    $scope.ChangeColor = function (status){
        
        if (status == 'sim'){
            return 'success';
        }
        else
        {
            return 'dangerous';
        }                    
    }
        
    //////////////////////////////////////////////////////////////////////////////// 
    
    
    //Handling Scheduler Chart Statistics Functions //////////////////////////////////
    $scope.partialFileGrafico = 'web_admin/admin.grafico.agendamentos.html';
    
    var timeSlots = agendaServ.getTimeSlots();
    
    $scope.statScheduled;
    
    var updateChart = function(){
        
        var myLabels = [];
        var dataSerie1 = [];
        var dataSerie2 = [];   
        

        _.forEach(timeSlots, function(value, key) {
            myLabels.push(value);
        });
        
        _.forEach($scope.statScheduled, function(value, key) {
            dataSerie1.push(value.$value);
        });
        
        console.log("StatScheduledArray:", dataSerie1);

        $scope.labels = myLabels;
        $scope.series = ['Agendados', 'Presentes'];

        $scope.data = [
          dataSerie1,
          [0, 0, 0, 0, 0, 0, 0]
        ];    
        
    }
    
    
    
    agendaServ.getScheduledCountPerHour(dateY).then(function(TstatScheduled, ref){
        $scope.statScheduled = TstatScheduled;
        
        $scope.statScheduled.$watch(function(data){
        console.log("New data detected, updating chart...")
        updateChart();
        
        });
        
        updateChart();
        
    });
    
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////////////////
    
});