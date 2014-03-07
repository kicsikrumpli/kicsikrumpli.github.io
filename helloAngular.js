var demoApp = angular.module('demoApp',['ngRoute']);

demoApp.config(function($routeProvider){
	$routeProvider.when('/view1',{
		controller:	 'simpleController',
		templateUrl: 'partials/view1.html'
	}).when('/view2',{
		controller:  'simpleController',
		templateUrl: 'partials/view2.html'
	}).otherwise({redirectTo: '/view1'});
});

demoApp.controller('simpleController',function($scope){
	$scope.customers = [
		{name: 'john smith', city:'Phoenix'},
		{name: 'john doe', city: 'new york'},
		{name: 'jane doe', city: 'san francisco'},
		{name: 'john jane', city: 'boston'}
	]
	$scope.addCustomer = function(){
		$scope.customers.push({name:$scope.newCust.name , city:$scope.newCust.city});
	}
});
