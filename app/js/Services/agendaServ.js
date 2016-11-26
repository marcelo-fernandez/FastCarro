//SERVICE:      Agendamento
//DESCRIPTION:  Wrapper Service for Firebase Authentication
//Revealing Pattern implemented with IFEE (to create some scope)
//
(function () {

    function agendaServ($q, $http, $firebaseObject, $firebaseArray) {
        console.log("agendaServ.js service loaded");
        
        var clienteData;
        var carroData;
        var carrosPorHorario = 2;
        var diaAgenda;
        var horaAgenda;
        
        var timeSlots = {
                800: '08:00',
                830: '08:30',
                900: '09:00',
                930: '09:30',
                1000: '10:00',
                1030: '10:30',
                1100: '11:00',
                1130: '11:30',
                1300: '13:00',
                1330: '13:30',
                1400: '14:00',
                1430: '14:30',
                1500: '15:00',
                1530: '15:30',
                1600: '16:00',
                1630: '16:30',
                1700: '17:00'
            };   
        
        var controlTimeSlotInit = {
                        800: 0,
                        830: 0,
                        900: 0,
                        930: 0,
                        1000: 0,
                        1030: 0,
                        1100: 0,
                        1130: 0,
                        1300: 0,
                        1330: 0,
                        1400: 0,
                        1430: 0,
                        1500: 0,
                        1530: 0,
                        1600: 0,
                        1630: 0,
                        1700: 0
                    }; 
    
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
        
        function getCurrentScheduled(){
            
            return {data: diaAgenda, hora: horaAgenda}
        }
        
        function getCurrentClientData(){
            return clienteData;
        }
        
        function getCurrentCarData(){
            return carroData;
        }

        function emailToKey(emailAddress){
            return btoa(emailAddress);
        }

        function keyToEmail(key){
            return atob(key);
        }
        
        function getAddressFromCEP(cep){
            var def = $q.defer();
            
            $http({
                url: 'https://viacep.com.br/ws/' + cep.replace('-','') + '/json/',
                method: 'GET'
            })
            .success(function (data){
                console.log(data);
                def.resolve(data);
            })
            .error(function(){
                def.reject("Não foi possivel obter endereco");
            })
            
            return def.promise;
            
        }
        
        function saveClient(nome, email, tel, cep, carData){
            
            var def = $q.defer();
            
            getCurrentDateTime().then(function(currentDate){
 
                var data = {
                        "Nome": nome,
                        "Email": email,
                        "Tel": tel,
                        "Cep": cep,
                        "Acesso": currentDate.utcDate.toTimeString()
                };
                
                
                console.log("save client was called with name=" + email);

                var uid = firebase.database().ref('/Log/'+ currentDate.year + '/' + currentDate.monthPart + '/' + currentDate.dateCode + '/' + emailToKey(email)).push(data);
                
                clienteData = data;
                carroData = carData;
                
                getAddressFromCEP(data.Cep).then(function(address){

                    data.Logradouro =   address.logradouro 
                    data.Complemento = address.complemento
                    data.Bairro = address.bairro
                    data.Localidade = address.localidade
                    data.Uf = address.uf
                    data.Unidade = address.unidade
                    data.Ibge = address.ibge
                    data.Gia = address.gia

                    uid.set(data);
                
                })
                
                def.resolve(clienteData);
                console.log("Client Data Saved:", clienteData);
            })
            
            return def.promise;    
            
        }
        
        function saveCar(email, key, carData){
            console.log("Save car in progres__________________");
                       
            var uid = firebase.database().ref('/Log/' + emailToKey(email) + '/' + key + '/Carro').set(carData);
            console.log("Car Data Saved:");
            
            carroData = carData;
            
            return uid;
        }
        
        function saveAgenda(selDate, selTime){
            console.log("Save Agenda Called")
            var def = $q.defer();
            
            var clientID = emailToKey(clienteData.Email);
            
            year = selDate.substring(0,4);
            month = selDate.substring(4,6);
            day = selDate.substring(6,8);
            
            try {
                if (selTime.length < 4) {
                    horaAgenda = "0" + selTime.substring(0,1) + ":" + selTime.substring(1,3);
                }
                else{
                    horaAgenda = selTime.substring(0,2) + ":" + selTime.substring(2,4);
                }
            }
            catch(err){
                console.log("erro na conversao do horarios: " + err.message)
            }
            
            diaAgenda = selDate.substring(6,8) + "/" + month + "/" + year; 
            
            clienteData.HoraCode = parseInt(selTime);
            
            var registro = {"dados": clienteData, "carro": carroData};
            
            
            //Verifica se 'e o primeiro agendamento do dia para criar todos os timeSlots de controle
            
            var refControle = firebase.database().ref('/Agendamentos/' + year + '/' + month + '/' + day + '/controle/');
            
            refControle.once("value", function(snapshot) {
                if (!snapshot.exists()){
                    refControle.set(controlTimeSlotInit);
                    def.resolve(0);
                }
            });
                
            //Adiciona o cantador para o dia e hora selecionado para o agendamento        
            var ref = firebase.database().ref('/Agendamentos/' + year + '/' + month + '/' + day + '/controle/' + selTime);

            var syncObject = $firebaseObject(ref);

            syncObject.$loaded().then(function(total){

                console.log("syncObj", total);

                if (typeof total.$value === 'undefined' || total.$value === null || total.$value < 2){
                    console.log("Entering in transaction mode", total, registro)
                    firebase.database().ref('/Agendamentos/' + year + '/' + month + '/' + day + '/cliente' ).push(registro);

                    firebase.database().ref('/Agendamentos/' + year + '/' + month + '/' + day + '/controle/' + selTime).transaction(function(total){
                     return total+1  
                    })

                    def.resolve(total+1);
                }
                else{
                    alert("Horario esgotou!");
                    def.reject(-1);
                 }
            });
      
            return def.promise;

        }
        
        
        
        function getScheduledCars(selDate){ 
            
            var def = $q.defer();
            
            dateObj = stripDate(selDate);
            
            
            console.log('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente');
            var ref = firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/cliente').orderByChild("dados/HoraCode");
            
            var syncArray = $firebaseArray(ref);        
                
            syncArray.$loaded().then(function(array){
                
                def.resolve(array);
                
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
            
            return {date: date, day: dd, month: mm, year: yyyy, code: yyyy+mm+dd}
            
        }
        
        function getAvailableDates(){
            
            var def = $q.defer();
            
            var result = {};
            var daysAhead = 15;
            
            var weekday = new Array('Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado');
                        
            for (var i=0; i<daysAhead; i++) {
                var d = new Date();
                d.setDate(d.getDate() + i);
                
                
                if (d.getDay() > 0)
                {
                    var dayOfWeek = weekday[d.getDay()];
                    var labelDay = formatDate(d);
                    console.log("GetAvailableDates date", i, formatDate(d).key);
                    console.log(labelDay.label);
                    var label = new Array (labelDay.label, dayOfWeek);
                    
                    result[formatDate(d).key] = label.join(' (')+")";
                }
            }

            console.log("Get Available Dates called:");
            console.log(result);
            
            def.resolve(result);
            
            return def.promise;

        }   
        
        function getScheduledCountPerHour(tDate){
            
            var dateObj = stripDate(tDate);
            
            var def = $q.defer();
            
            console.log('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/controle');
            var ref = firebase.database().ref('Agendamentos/' + dateObj.year + '/' + dateObj.month + '/' + dateObj.day + '/controle').orderByKey();
            
            var syncArray = $firebaseArray(ref);        
                
            syncArray.$loaded().then(function(array){
                
                def.resolve(array);
                
            });
                                     
            return def.promise; 
        }
        
        function getAvailableTimes(){
            
            //var def = $q.defer;
            return timeSlots;
            
            //def.resolve(avaTimes);
            
            //return def.promise;
            
            return avaTimes;
        }
        
        function getTimeSlots(){
            return timeSlots;
        }
        
        //Expose the public API methods - https://fipe-parallelum.rhcloud.com/api/v1/carros/marcas/59/modelos/5940/anos/2014-3
        return {
            saveClient: saveClient,
            emailToKey: emailToKey,
            keyToEmail: keyToEmail,
            saveCar: saveCar,
            getCurrentClientData: getCurrentClientData,
            getAvailableDates: getAvailableDates,
            getAvailableTimes: getAvailableTimes,
            getCurrentCarData: getCurrentCarData,
            saveAgenda: saveAgenda,
            getCurrentDateTime: getCurrentDateTime,
            getCurrentScheduled: getCurrentScheduled,
            getScheduledCars: getScheduledCars,
            getTimeSlots: getTimeSlots,
            getScheduledCountPerHour: getScheduledCountPerHour
        };
    };

    //Get a reference of medApp Module
    var medApp = angular.module('Zeroclube');

    //Register the service
    medApp.factory('agendaServ', agendaServ);

}());
