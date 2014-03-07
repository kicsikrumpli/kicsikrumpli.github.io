ng-app=<module name>
---
also works: data-ng-app="..."
'data-...' works against some validators!
or ng-app="" for in-place stuff

ng-model="name" : adds the 'name' property to the view-model
---
or data-ng-model

{{ data binding expression }} <- binds to the expression in the view-model 
---

ng-init or data-ng-init:
---
use controllers instead
good for some primitive model initialization
eg.:
<div class="container" ng-init="names=['hapci','kuka', 'morgo']"></div>
<div ng-repeat="n in names" >{{n}}</div>

filters: http://docs.angularjs.org/api/ng/filter
---
<li ng-repeat="cust in customers | filter:name | orderBy:'name'">{{cust.name | uppercase}} - {{cust.city}}</li>
or custom filters

Views, controllers, scope
---
scope = view-model

don't put logic in the View. Put it in a separate Controller
Glue between the two: $scope

		+------+     $scope     +------------+     
		| View | <------------> | Controller |    
		+------+                +------------+          

$scope is an object
the view and the controller don't know about each other. That is how the glue comes in.
viewmodel: the scope. model for the view.

function simpleController($scope){
	console.log('simpleController');
	$scope.customers = [
		{name: 'john smith', city:'Phoenix'},
		{name: 'john doe', city: 'new york'},
		{name: 'jane doe', city: 'san francisco'}
		{name: 'john jane', city: 'boston'}
	];
}
use this instead of ng-init="customers=[...]"

simple controller, $scope is injected...

tie it to a view:
<div ng-controller="simpleController">...</div>
can have multiple controllers in a page, 
scope applies only to the parts where controller is declared

Models, Routes, Factories and Services
---
a module can have a config function to define different routes
routes are a concept of single page applications (SPAs)
on a route one defines a view and a controller - this way the controller is not hard coded in the view
scope is still the glue between the view and the controller
The controller has factories

					+-------------+
					|   Module    |
					+------+------+
					       |
					 +-----+-----+
					 |  Config   |
					 +-----+-----+
					       | 
					 +-----+-----+
					 |  Routes   |
				     +-----+-----+
				    	   | 
			  +------------+-------------+
			  |                          |
	   +------+------+   $scope   +------+------+ 
	   |    View     |<---------->| Controller  |
	   +------+------+            +------+------+
			  |  			    		 |
	   +------+------+            +------+------+
	   | directives  |		      |  *Module    |
	   +-------------+		      +-------------+

*: services/factory/resources/provider/value

treat modules as containers:

		<div ng-app="moduleName">...
		
to crate the module:

		var demoApp = angular.module("moduleName",[]);
		
Off of the module one can create configs, filters, directives, controllers. They will be in the container.
[]: dependency injection. Module might rely on other modules.

		var demoApp = angular.module("moduleName",['helperModule']);

find helperModule, make it available, inject it! 

to create a controller Off of a module:

		var demoApp = angular.module('demoApp',[]);
		demoApp.controller('simpleController',function($scope){
			$scope.customers = [
				{name: 'john smith', city:'Phoenix'},
				{name: 'john doe', city: 'new york'},
				{name: 'jane doe', city: 'san francisco'},
				{name: 'john jane', city: 'boston'}
			]
		});


Of course the controller function does not have to be anonymous, it can be a reference to a function too...

For multiple controllers on a single module:

		var demoApp = angular.module('demoApp',[]);
		var controllers = {};
		controller.SimpleController = function($scope){
				$scope.customers = [
					{name: 'john smith', city:'Phoenix'},
					{name: 'john doe', city: 'new york'},
					{name: 'jane doe', city: 'san francisco'},
					{name: 'john jane', city: 'boston'}
				]
		}
		demoApp.controller(controllers);
		
What is the role of routes? We may need to load different views into the shell page.

		+---------+   /view2    +---------+
		|  View1  | ----------> |  View2  |
		+---------+             +---------+
             A /view1                | /view3
             |                       V
		+---------+   /view4    +---------+
		|  View4  | <---------- |  View3  |
		+---------+             +---------+
		
We want to be able to load different fragments:

		var demoApp = angular.module('demoApp',['ngRoute']);
		demoApp.config(function ($routeProvider){
			$routeProvider.when('/',
				{
					controller:  'simpleController',
					templateUrl: 'view1.html'
				}
			).when('/partial2',
				{
					controller:  'simpleController',
					templateUrl: 'view2.html'
				}
			).otherwise({redirectTo: '/'});
		});
		
note, that routing after angular 1.2. requires angular-route.js separately.
also templateUrl: 'view2.html' either gets view2.html by an ajax call.
If it is retrieved from a server (be it localhost) through http, that is fine.
For local files there might be a problem: "Cross origin requests are only supported for HTTP"

solution according to http://stackoverflow.com/questions/19847252/cross-origin-requests-are-only-supported-for-http

		<script type="text/ng-template" id="view2.html">
		  contents of view2.html
		</script>
		
This needs to appear after ng-app. Also, in the html file put

		<div ng-template=""></div>
		
as a placeholder where the views will be loaded. Changing views reloads the controller. Links between the views are

		<a href="#/view2"> view2 </a>
		
Note2: history is automatically managed.

Using factories and services
---
allows us not to hard code data in controllers, but rather place is in a factory (or...).
factory vs. service vs. value(or value provider) vs. provider is the way the data getter object is created and used:

  -factory returns a method
  -service defines functions with the keyword this
  -providers define the method $get()
  -value is for a simple config value with a name-value pair
  
 To define a factory:
 
		var demoApp = angular.module('demoApp',[]);
		
		demoApp.factory('simpleFactory',function(){
			var factory = {};
			var customers = [];
			factory.getCustomers = function(){
				return customers;
			};
			return factory;
		});
		
		demoApp.controller('simpleController',function($scope,simpleFactory){
			//$scope.customers = simpleFactory.getCustomers();
			$scope.customers = [];
			init(); //if we want to have a separate init function.
			function init(){
				$scope.customers = simpleFactory.getCustomers();
			}
		});

The factory is injected at runtime into the controller.
We might as well have $http injected into the factory, and on that make ajax calls.

source: AngularJS Fundamentals In 60-ish Minutes [http://www.youtube.com/watch?v=i9MHigUZKEM]