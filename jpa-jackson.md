JPA, Jackson and infinite loops
---

Assume the following setup of domain objects:

    +------------+             +--------------+
	|Class A     | 1        1  |Class B       |
	+------------+ ----------> +--------------+
	|B b;        |             |A a;          |
	+------------+             +--------------+
	
where objects are managed by JPA. One to one relationship is set up properly with the annotation property "mappedBy". When fetching existing entities from a repository, JPA knows perfectly well which side is the owner and which side is the inverse of the relationship. Thus it does not fall into an infinite loop.

Enter scene Jackson. Say we wish to return Class A as Json from a spring mvc controller:

   @RequestMapping(value = "/foourl", produces = "application/Json")
   @ResponseBody
   public A controllerMethod(){
		A a = aService.getA(someParam);
		return a;
   }

This will return a json object along the lines:

    {"b":{"a":{"b":{"a":{"b":{...
	
This is obviously not what we wanted. The problem is that Jackson has no idea (and of course why should it have any) that the relationship between Class A and Class B is a unidirectional one and will try to resolve all references. The solution to the problem is fairly straightforward; we need a way to stop Jackson from trying to resolve references, and this is exactly what we can achieve with the annotation

    @JsonIgnore
  
Hence:

	@Entity
    public class A {
	
		@OneToOne
		private B b;
		
		...
	}
	
	@Entity
	public class B {
	
		@JsonIgnore
		@OneToOne(mappedBy="b")
		private A a;
		
		...
	}
	
Tadaaaam!
