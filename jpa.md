JPA

persistent entity
---

	@Entity
	@Table(name = "my_entity")
	public class MyEntity{
		@Id
		@Column(name = "my_entity_id")
		@GeneratedValue(strategy = GenerationType.AUTO)
		private long id;
		
		public void setId(long id){
			this.id=id;
		}
		
		public long getId(){
			return this.id;
		}
		
		...
	}

@Table, @Column are optional
@Id designates primary key; more than one->compound key

Relation types
---

1. Multiplicity:
	+ single value
	
			+-----------+            +-------+
			|     A     | 1        1 |   B   |
			+-----------+ ---------- +-------+
			|B b;       |            |       |
			+-----------+            +-------+
	
	+ multi value
	
			+-----------+            +-------+
			|     A     | 1        * |   B   |
			+-----------+ ---------- +-------+
			|Coll<B> bs;|            |       |
			+-----------+            +-------+
	
2. Navigability
	+ unidirectional
	
			+-------+            +-------+
			|   A   | ---------> |   B   |
			+-------+            +-------+
	
	+ bidirectional
	
			+-------+            +-------+
			|   A   | <--------> |   B   |
			+-------+            +-------+

	for bidirectional arrows may be omitted

one-to-one unidirectional
---
	
		+-----------+              +-----------+
		|     A     | 1          1 |     B     |
		+-----------+ -----------> +-----------+
		|B b;       |              |           |
		+-----------+              +-----------+
		@OneToOne					
		B b;					

Class B has no reference to the owner of the relationship, class A.
The owner declares the relationship with the annotation *@OneToOne*.

                          +------------+
                          |            V
		+------+-----+---------+   +------+-----+
		| a_id | ... | fk_b_id |   | b_id | ... |
		+------+-----+---------+   +------+-----+
		| ...  | ... | ...     |   | ...  | ... |


This results in the table A having a foreign key to B.

To declare which foreign key is used for the join:

	@OneToOne
	@JoinColumn(name = "b_id")
	B b;

inner join: @OneToOne(optional=false)
outer join: @OneToOne(optional=true)

to remove foreign key and require primary keys to match on join operation, use the annotation @PrimaryKeyJoinColumn

one-to-one bidirectional
---

In a biderectional relation one side is the *owner*, the other is the inverse side. The owner is responsible for maintaining the relationship: it either holds a foreign key to the inverse side, or declares a join table.

Had no side been declared as owner, the relationship would decompose to two unidirectional relations

		+-----------+ 1          1 +-----------+
		|     A     | -----------> |     B     |
		+-----------+ 1          1 +-----------+
		|B b;       | <----------- |A a;       |
		+-----------+              +-----------+
		@OneToOne					@OneToOne
		B b;						A a;

           +-----------------------------------------+
           |              +------------+             |
           V              |            V             |
		+------+-----+---------+   +------+-----+---------+
		| a_id | ... | fk_b_id |   | b_id | ... | fk_a_id |
		+------+-----+---------+   +------+-----+---------+
		| ...  | ... | ...     |   | ...  | ... |         |

with the two resulting tables referencing each other. We do not want that! We want a bidirectional relationship, not two unidirectional ones!

The owner side may declare the foreign key that references the inverse side with @JoinColumn.
The inverse side declares the *Java class property* that references it with the annotation attribute mappedBy.

		Owner                      Inverse
		+-----------+              +-----------+
		|     A     | 1          1 |     B     |
		+-----------+ ------------ +-----------+
		|B b;       |              |A a;       |
		+-----------+              +-----------+
		@OneToOne					
		@JoinColumn(name="b_id")    @OneToOne(mappedBy="b")
		B b;						A a;

This results in the tables:
		
                          +------------+
                          |            V
		+------+-----+---------+   +------+-----+
		| a_id | ... | fk_b_id |   | b_id | ... |
		+------+-----+---------+   +------+-----+
		| ...  | ... | ...     |   | ...  | ... |

It is important to note that only changes made through the owner side are saved to both sides of the relationship.
E.g.:

	a.setB(b); will create the appropriate relation
	
	b.setA(a); will not create the one-to-one connection in the database

many-to-one unidirectional #1
---

If the MANY side (Child) is the owner of the relationship ('*' marks the owner):

		Father                     Child*
		+-----------+              +-----------+
		|     A     |  1        N  |     B     |
		+-----------+ <----------- +-----------+
		|           |              |A a;       |
		+-----------+              +-----------+
		                           @ManyToOne
		           				   A a;

which results in the tables:								   
								   
            +--------------------------------+
            V                                |
		+------+-----+     +------+-----+---------+
		| a_id | ... |     | b_id | ... |fk_a_id  |
		+------+-----+     +------+-----+---------+
		| ...  | ... |     | ...  | ... |...      | 
		Father             Child

Only the child has to be annotated with	the annotation @ManyToOne.

many-to-one unidirectional #2
---

In case the ONE side (Father) is the owner of the relationship, a JoinTable has to be declared.

		Father*                    Child
		+-----------+              +-----------+
		|     A     | 1         N  |     B     |
		+-----------+ -----------> +-----------+
		|Coll<B> bs;|              |           |
		+-----------+              +-----------+
		@OneToMany(...)					
		Coll<B> bs;					

Which results in the tables:
		
           +--------------------+		  +-------------+
           V                    |         |             V
		+------+-----+     +---------+---------+     +------+-----+
		| a_id | ... |     | fk_a_id | fk_b_id |     | b_id | ... |
		+------+-----+     +---------+---------+     +------+-----+
		| ...  | ... |     | ...     |         |     | ...  | ... | 
		Father             JoinTable                 Child

To declare the join table:

    @ManyToOne
    @JoinTable(
    		name = "A_B",
    		joinColumns = {@JoinColumn(name = "a_id")},
    		inverseJoinColumns = {@JoinColumn(name = "b_id")})
    private Collection<B> bs;
	
where joinColumns refer to the primary keys of the owner side, inverseJoinColumns refer to the primary keys of the inverse side. The name attribute of JoinTable is the name of the resulting table.
		
many-to-one bidirectional
---

		Father                     Child*
		+-----------+              +-----------+
		|     A     |  1        N  |     B     |
		+-----------+ <----------> +-----------+
		|Coll<B> bs;|              |A a;       |
		+-----------+              +-----------+
		@OneToMany(mappedBy="a")   @ManyToOne
		Coll<B> bs;				   A a;

            +--------------------------------+
            V                                |
		+------+-----+     +------+-----+---------+
		| a_id | ... |     | b_id | ... |fk_a_id  |
		+------+-----+     +------+-----+---------+
		| ...  | ... |     | ...  | ... |...      | 
		Father             Child
	
In a bidirectional ManyToOne it is *mandatory* to declare the MANY side as the owner and the ONE side as inverse.

many-to-many unidirectional
---

In a unidirectional many-to-many relation set up as:

		Father*                    Child
		+-----------+              +-----------+
		|     A     | N         M  |     B     |
		+-----------+ -----------> +-----------+
		|Coll<B> bs;|              |           |
		+-----------+              +-----------+
		@ManyToMany(...)                     
		Coll<B> bs;				        

there is no reference in B to all the A's that it belongs to. Setting up this relationship requres a join table, which takes the structure:

           +--------------------+		  +-------------+
           V                    |         |             V
		+------+-----+     +---------+---------+     +------+-----+
		| a_id | ... |     | fk_a_id | fk_b_id |     | b_id | ... |
		+------+-----+     +---------+---------+     +------+-----+
		| ...  | ... |     | ...     |         |     | ...  | ... | 
		Father             JoinTable                 Child

		<----------------Class A--------------->     <---Class B--->
		
This is not different from setting up the relationship as a one-to-many relationship with the ONE side declared as owner. Like so:

		Father*                    Child
		+-----------+              +-----------+
		|     A     | 1         M  |     B     |
		+-----------+ -----------> +-----------+
		|Coll<B> bs;|              |           |
		+-----------+              +-----------+
		@OneToMany(...)                     
		Coll<B> bs;				        

In conclusion there is no difference between a unidirectional many-to-many and a unidirectional one-to-many. 

many-to-many bidirectional
---

The owner of the relationship depends on the semantics of the problem. The inverse side requires the declaration of mappedBy attribute.

		Person*                       Song
		+-----------+                 +-----------+
		|     A     |  N  /likes/  N  |     B     |
		+-----------+ <-------------> +-----------+
		|Coll<B> bs;|                 |Coll<A> as;|
		+-----------+                 +-----------+
		@ManyToMany                   @ManyToMany(mappedBy="bs")
		Coll<B> bs;			 	      Coll<A> as;

This results in the familiar database schema with a join table. On the one hand the schema will look the same regardless of which side is appointed as owner. In the other hand, the connection has to be set from the owner side in code.

           +--------------------+		  +-------------+
           V                    |         |             V
		+------+-----+     +---------+---------+     +------+-----+
		| a_id | ... |     | fk_a_id | fk_b_id |     | b_id | ... |
		+------+-----+     +---------+---------+     +------+-----+
		| ...  | ... |     | ...     |         |     | ...  | ... | 
		Father             JoinTable                 Child
		
Note, that a bidirectional many-to-many usually is a sign of poorly executed data modelling, in that it is either oversimplified, or not thoroughly thought through. Along some property of the association many-to-many can usually be decomposed into two one-to-many relations. In the example this would translate to

		Person                    Likes*                    Song
		+-----------+             +-----------+             +-----------+
		|     A     | 1         N |    A_B    | M         1 |     B     |
		+-----------+ ----------- +-----------+ ----------- +-----------+
		|Coll<A_B> l|             |A a;       |             |Coll<A_B> l|
		+-----------+             |B b;       |             +-----------+
		                          +-----------+       
		@OneToMany(mappedBy="a")  @ManyToOne                @OneToMany(mappedBy="b")
		Coll<A_B> l;              A a;                      Coll<A_B> l;
                                  @ManyToOne
                                  B b;

Note on many-to-many
---

The use of many-to-many can be avoided in any case and one-to-many is preferred instead.
								  
								  