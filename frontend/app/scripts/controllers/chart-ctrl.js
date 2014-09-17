'use strict'; // ES5+ JS

var app = angular.module('jobcoin'); // Application

////////////////////////
// CONTROLLER
////////////////////////

app.controller('ChartCtrl', // Controller
  ['$rootScope','$scope', 'addressService', '$state', '$interval', 'promiseObj', // Controller -- Dependencies
  function ($rootScope, $scope, addressService, $state, $interval, promiseObj)  { // Controller -- Namespaces

    $scope.transformData = function(data){

        // Data placeholders
        var balanceTimeline = [];
        var timeStampTimeline = [];
        
        // Parse JSON
        var myData = angular.fromJson(data.data);
        var transactions = myData.transactions;

        // Balance Incrementor
        var nowBalance = 0;
        
        // Build data for graph    
        for(var i = 0; i <= transactions.length-1; i++){

          // Subtract if the transaction is
          // from the current user to someone else
          if( transactions[i].fromAddress && 
              transactions[i].fromAddress === addressService.address) {
                nowBalance = parseInt(nowBalance) - parseInt(transactions[i].amount);
                balanceTimeline.push(nowBalance);            
          } else if (
              // add for the opposite or
              // if its the genisis balance 
              transactions[i].fromAddress && 
              transactions[i].fromAddress !== addressService.address ||
              transactions[i].fromAddress === undefined ) {
                nowBalance = parseInt(nowBalance) + parseInt(transactions[i].amount);
                balanceTimeline.push(nowBalance);
          } 

          // Push timeline increment
          
          // NVD3 won't play nice with these even after formatting
          // in setMappedData, would require more digging
          // timeStampTimeline.push(transactions[i]['timestamp']);  
          timeStampTimeline.push(i); // Lets use a simple increment instead
        };

        // Format the dates
        // NVD3 can chart against string
        // timeStampTimeline = _.map(timeStampTimeline, function(d){
        //   return d3.time.format('%b-%d-%X')(new Date(d)); 
        //   // return d;
        // });

        // Map them together for charting;
        $scope.chartData = [{
          "key": "Series 1",
          "values": _.zip(timeStampTimeline, balanceTimeline)
        }];
    }

    $scope.transformData(promiseObj);

    $rootScope.$on("sentCoins", function(event, obj){
        obj.then(function(data){
            $scope.transformData(data);  
        });
    });
}]);
