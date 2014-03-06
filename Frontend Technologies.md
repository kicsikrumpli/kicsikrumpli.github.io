Frontend Technologies
===

Agenda
---
+ html5
+ xml, json
+ console
+ selectors
+ css
+ box model
+ floating & positioning
+ layouts
+ DOM lifecycle

html5
---
so far a moving target, some reference implementations exist
technologies:

+ canvas
+ webgl
+ svg
+ drag & drop
+ local storage
+ history api
+ geolocation

+ responsive design

	the final product is not made for a large screen or mobile or whatever,
	it is made for the client

+ websockets
+ webworkers

##key points of development
Development shouldn't follow the "throw it over the wall methodology"!

1. Look at your **A**udience
2. Look at your **R**equirements

	e.g.: accessibility, being able to bookmark

3. Look at your **C**ustomer

	develeopement environment is not the same as the final platform

XML
---
xhtml is over,
html5 replaces xhtml & works as an xml document

xml is evil...

JSON
---
Javascript Object Notation

{}
[1,2,3]
{a:'1', b:'2', c:'3', d:[], "ab":null}

avoids xml namespace hell, easy to parse

Console in the browser
---
almost a complete IDE
Firebug, chrome dev tools, safari web inspector, IE9 dev tools

+ DOM browser
+ Network
+ Sources
+ Profiling

i can has breakpointz

Http protocol
---
request-response protocol

+ request

	    GET /lolcats.html HTTP/1.1\n         |
	    Host: www.example.com\n         &lt;--- | HEADER
	    Content-length:3\n                   |
	    asd\n                           &lt;---   BODY
	    \n                              &lt;---   END

+ response

	    HTTP/1.1 200 OK                 &lt;---   FIRST LINE
	    Content-type: text\html              |
	    charset=UTF-8                        |
	    location:... 						 |
	    Date:...						&lt;--- | HEADER
	    Server:...							 |
	    Last-Modified:...  					 | *for cache invalidation
	    Etag								 | *content hash - 204 not modified based on this
	    contetnt-length:123\n                |
	    ...								&lt;---   BODY

Validation
---
Server side: against malicios content
client side: for user experience

GET-POST-DELETE-PUT
---
+OPTIONS, HEAD
Browsers only support get and post

GET: idempotent - can be called any number of times, does not change server side state
POST: cannot be created as a link

SSL
---

	[HTTP]
	|
	[SSL] - handshake: exchange keys. then initialize an ssl vector to encrypt data stream
	|
	[TCP]
	|
	[IP]
	|
	[ETH]

DOM lifecycle
---

1. Request
2. Response

 a thread starts parsing html
 if it finds img or css, a separate thread starts downloading them *separately*
 second thread works from a download queue
 if the parser encounters js, it blocks download until js is fully downloaded and executed

 hence js minify speeds up startup times

3. ON READY state: every piece of js has run, DOM is ready, but not all images and css are necessarily downloaded yet.
4. ON LOAD state: download queue is empty, no more repaints after this state

AJAX: asynchronous javascript

server side js
---

+ rhino: js interpreter built with java
+ ringo js: complete webserver
+ node.js

CSS - cascading style sheets
---

+ css selectors: $("div") &lt;- div is the selector

  selects div elements from the dom. (expression has its roots in xpath)

+ multiple selects: $("div,p,span")
+ select by id: $("#loginForm")

  behavior with multiple identical id's is not defined. They should be unique.
  search by id is fast - lookup with bucket hash. O(1)

+ select by class: $(".foo")
+ select by attribute: for &lt;div data-type="foo">... $("div[data-type=foo]")
+ select direct descendant: $("html>body")
+ select descendant: $("body div")
+ select directly adjecent sibling: $("h1+h3"): all h3's directly preceeded by sibling h1
+ select all following siblings: $("h1 ~ h3"): all h3's that follow a sibling h1
+ wildcard: *

jquery
---

+ hides some browser incompatibilities
+ prefix, suffix, inverse selection
+ meta selectors: $(":not(div)")
+ text node: $(":contains('foo')")
+ $("div:has(span)")
+ $("table tr:nth-child(5)") /even,odd,2n+1,3n+2,5

css rules
---

	css-selector {
		css-prop1: style1;
		css-prop2: style2;
	}

include in html:

	&lt;link href="layout.css" rel="stylesheet" type="text/css" />

Box-model
---

    +----------------------------------+
    |              margin              |
    |  +===========border===========+  |   
    |  ||          padding         ||  |
    |  ||  +....................+  ||  |
    |  ||  :                    :  ||  |
    |  ||  :                    :  ||  |
    |  ||  :      content       :  ||  |
    |  ||  :   (width/height)   :  ||  |
    |  ||  :                    :  ||  |
    |  ||  +....................+  ||  |
    |  ||                          ||  |
    |  +============================+  |
    |                                  |
    +----------------------------------+

vertical margins collapse, except when they don't

display: block; fills hspace, line break before and after
display: span; no line break, doesn't fill hspace
display: inline-block; fills encomapssing element. inline elements are placed on top of each ohre
display: none; removes element from dom tree
visibility: hidden; not rendered, still in dom tree

position: static; default, placed where it falls in page flow. top, left are ineffective
position: relative; places element at coordinates top, left relative to calculated position in page flow
position: absolute; at top,left coordinates relative to entire page OR first relative-positioned parent
position: fixed; fixed relative to medium (window)

float: text flows around box

order of elements with floats
---

1. float left
2. float rigbt
3. everything else

clear: left/right/both disables floats

Layouts
---
general rules:

+ use tables only for tables. not layouts!
+ don't use superfluous divs
+ SEO basics: meta-tags, title, alt attributes, pretty urls
+ accessibility - does it work without js?
+ avoid popups.
+ validate html, css
+ avoid popups
+ html specs restrict order of nested html elements:

	   ... >div* > ... > p > ... > span* > ...

   no nested p's
   no divs in p's

Single Page Applications
---
static html without templates + dynamic js + dynamic content from server
+ static SEO page without js 

Javascript - the tricky parts
===

+ imperative, structured + clojures
+ dynamic types (duck typing, no classes, no interfaces)

    duck typing: lloks like a duck, quacks like a duck...

+ js has objects but not classes
+ functions are first class citizens
+ pass by pointer value (that is: pass by reference)
+ automatic gc -> set unused references tu null!

			<html>
			<head>
					<script src="...jquery.js"></script>
					<script type="text/javascript">
						$(function(){
							$("body").append(" world!");
						});
					</script>
			</head>
			<body>
					hello
			</body>
			</html>

extrinsic values
---
+ null
+ undfined: declared but not defined

+ case sensitive

global namespace
---
+ window object
+ no block scope

local variables
---
    var x;
    var lolFn = function() {...}; //anon function

typeof x
---
+ number
+ string
+ boolean
+ function
+ object (null is an object)
+ undefined

string literals
---
    var foo = "this is a string literal";
**never** write
    var foo = new string("dont do this");

regexp can also be given as a literal

date literals
---
+ there is none
+ timezone cannot be queried from browser
+ but date is formatted according to timezone

operators
---
+ !!x turns any object into bool. 
	
		if (!!x) {...}

+ == compares: values for literals, reference for objects

	NaN == NaN gives false

+ === compares value + type. According to Crockford this should be used!

functions
---
if there is no return, then 
	
	return undefined;

exceptons
---
		try{
			...
		}catch(e){
			...
		}

only *one* catch branch

automatic ; inserion
---
pure evil!

Objects
---
		var a = new Array();
		var b = new Array(0,1,2);
		var c = [0,1,[2,2,2]];
		a[3] = b[3] = 3;

array notation with negative index: index will become an object property:

		a[-1]=-1;

if index is out of bounds, gap is filled up with undefined:

		x=[];
		...
		x[2]=2;
		->
		x=[undefined,undefined,2];

Objects:

		var o = new Object();
		o.foo=42;

		var b = new Object(o); //returns reference, not copy

Objects with json-notation:

		var c = {
			foo: 42,
			"-1":-1,
			f:function(param){
				return param;
			},
			o:{...}
		};

Object constructors
---
js has no notion of classes, but every function is a constructor
convention: capitalized name

		function MyObject(a,b,c){
			this.a = a;
			this.b = b;
			this.c = c;
		}
		...
		myObj = new MyObject(1,2,3);

+ a,b,c fields are public.
+ local avriables within a constructor behave like private fields

		function GetOnly(data){
			var _data = data;
			this.get = function(){
				return _data;
			}
		}

		//but!

		o.get() = 42; //is perfectly legal

+ new fn() is shorthand for

		function objFactory(a){
			var o = new Object();
			o.a = a;
			return o;
		}

Inheritance
---
js has prototypal inheritance

		function Cat(name){
			this.name = name;
		}

		lolCat = new Cat("lol");

		Cat.prototype.talk = function(){
			console.log(this.name + "  meow");
		}

We changed the behavior of Cat's prototype. This also affects lolCat. 

Traversing prototype chain
---
+ x.hasOwnProperty(...);
+ if not: x.prototype.hasOwnProperty(...);
+ all the way to Object.prototype

+ note that we are also allowed to expad Object.prototype

Object properties
---
yet another way to add props:

		Object.defineProperty(myObj,"mySuperProperty",{
			value:42,
			configurable:true,
			get:function(){
				return this.mySuperProperty;
			},
			set:function(val){
				this.mySuperProperty = val;
			}
		});

Clojures
---

+ (funtion instanceOf Object)===(Object instanceOf function) -> true
+ functions are objects
+ every argument of a function is optional - functions have no signatures
+ arguments are passed in an implicit arguments[] array

example of a clojure:

		function pow(n){
			return function(x){
				return x^n;
			}
		}

		powSquare = pow(2);
		pow10 = pow(10);
		pow10(2); -> 1024;

+ the keyword *this* is bound at runtime, takes the referece of the closest encompassing object;

example:

		var x = 1;
		function logX(){
			console.log(this.x);
		}

		logX(); -> 1; the closest encompassing object is window

		myObj = {
			myFunc: logX,
			x:42
		};

		myObj.myFunc(); -> 42; closest encompassing object is myObj, thus: this=myObj;


call, apply
---

+ fn.call(valueOfThis,param1,param2,...);
+ fn.apply(valueOfThis,params[]);

the value of this becomes valueOfThis passed in as a reference

Proxy object
---
used for binding the context

		function proxy(fn, thisObject){
			return function(){
				fn.apply(thisObject || this, arguments); //the array arguments is always in scope!
			}
		}

binds the value of this permanently for the function created with the proxy

Module pattern
---
an anonymous function with a call to it

		(function(){...})(params);

+ identity module

		var result = (function(x){return x;})(42);
		result <-- 42;

+ create object that returns an interface

		var myObj = (function(defaultSize){
			var _size = defaultSize;
			return { getSize: function(){return _size;}, //NOT this._size, this===undefined
					 setSize: function(s){_size = s; return this;}
			};
		})(42);

		myOBj.getSzie(); -> 42;
		myObj.setSize(12).setSize(48); //currying
		myOBj.getSzie(); -> 48;

JS frameworks
---

+ we need frameworks because every browser is a bit different
+ because js-api is too dumb
+ need a way to reduce boilerplate:
	- jquery: still relevant
	- dojo
	- prototype
	- mooTools
	- bower: depenency injection
	- grunt: module framework
+ platforms
	- YUI
	- GWT: legacy only
+ MVC frameworks

jquery
---

+ css selectors on steroids
+ commandeers the symbol $

		$("p").addClass("foo").removeClass("bar").toggleClass("baz").css("top","1px");
		$("a").attr("href","trollolo.htm");
		$("p").text("<span>lol</span>"); ///displays as text, characters are escaped
		$("p").html("<span>lol</span>"); ///displays as html, characters are not escaped!

event handling
---
event handler:

		var handler = function(e){
			console.log(e);
			e.stopImediatePropagation(); //prevents other handlers from accessing event
			e.stopPropagation(); // stops event bubbling
			e.preventDefault(); // prevents browser's default action
			return false; //prevent all
		}

triggering events:

		$(window).trigger("login");

when multiple modules are used, it is good practice, to communicate with events between them

binding to events:
		
		$(".foo").bind("click mouseleave",handler);
		$(".foo").unbind("mouseleave",handler);

		$.bind("ready",f); //document READY
		same as 
		$(f);

		$.load(f); same as
		$.bind("load",f); //document LOADED

.bind() does not bind to newly created nodes. Use .on() instead, which works for dynamically inserted elements as well;
Instead of .unbind() use .off();

Ajax
---

+ $.get();
+ $.post();
+ $.getJson();
+ $.ajax(url,settings);
+ $("#someDiv").load("/profile?foo=bar"); //fills someDiv on success

js memory model
---

+ single threaded
+ execution / event queue
+ threads are never paused, interrupted, yielded
+ queue is shared between UI and browser events (except for html5 webworkers)
+ eventqueue: processed when idle. Order of sequence not guaranteed.
+ setTimeOut places on eventqueue
+ it is good practice to decompose animations to multiple stages. ie.:

		f1(){
			setTimeOut(0,f2); //this places f2 in the eventQueue
			...
		}

JSLINT
---
javascript is loose, use jslint (~checkstyle & findbugs for java)
	