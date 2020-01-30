Notes taken from [datstax data modeling](https://academy.datastax.com/resources/ds220-data-modeling)

# 01
- Cassandra does not support joins
- create model with the queries in mind
- steps:
    1. Conceptual Data Model + Application Workflow (the queries)
    2. Map Conceptual to Logical
    3. Logical Data Model
    4. Physical Optimization
    5. Physical Data Model
- different data models have different costs
- fits most domains
    - data can be stored geographically close to clients
    - high availability
    - scales linearly
    - peers instead of master / slave
    - large amounts of data
    - e.g.: big data
        - volume
        - velocity
        - ...

## ex 1
        $ cqlsh

        cqlsh> select * from system.schema_keyspaces;

        keyspace_name  | durable_writes | strategy_class                                  | strategy_options
        ---------------+----------------+-------------------------------------------------+----------------------------
            dse_system |           True | org.apache.cassandra.locator.EverywhereStrategy |                         {}
             OpsCenter |           True |     org.apache.cassandra.locator.SimpleStrategy | {"replication_factor":"1"}
                system |           True |      org.apache.cassandra.locator.LocalStrategy |                         {}
         system_traces |           True |     org.apache.cassandra.locator.SimpleStrategy | {"replication_factor":"2"}

        (4 rows)
        cqlsh> 

## ex2
- keyspaces
    - like a namespace you can put your tables into
    - replication parameters are required

            CREATE KEYSPACE killrvideo
            WITH REPLICATION = {
                'class' : 'SimpleStrategy',
                'replication_factor' : 1
            };

    - switch into keyspace with `USE`
- tables
    - keyspaces contain tables
    - tables contain data

            CREATE TABLE table1 (
                column1 TEXT,
                column2 TEXT,
                column3 INT,
                PRIMARY KEY (column1)
            );

            CREATE TABLE users (
                user_id UUID,
                first_name TEXT,
                last_name TEXT,
                primary_key (user_id)
            );

- basic data types
    - text
        - UTF8
        - varchar is same as text
    - int
        - signed
        - 32 bits
    - UUID (universally unique identifier)
    - TIMEUUID
        - embeds a timestamp value
        - sortable
        - generate via now()
        - use for timeseries
    - timestamp
        - ms-s since epoch
- importing csv files
    - COPY imports / exports csv

            COPY table1 (column1, column2, column3) 
            FROM 'tabledata.csv' 
            WITH HEADER=true;

- SELECT

        SELECT * 
        FROM table1;

        SELECT column1, column2, column3 
        FROM table1;

        SELECT COUNT(*) 
        FROM table1;

        SELECT * 
        FROM table1 
        LIMIT 10;

## Exercise 3: Composite Partition Keys

        CREATE TABLE videos_by_title_year (
            title text, 
            added_year int, 
            added_date timestamp, 
            description_text text, 
            user_id uuid, 
            video_id uuid, 
            PRIMARY KEY ((title, added_year))
        );

        COPY videos_by_title_year FROM 'videos_by_title_year.csv' WITH header=true;

        SELECT * FROM videos_by_title_year WHERE added_year = 2015;

        InvalidRequest: code=2200 [Invalid query] message="Partitioning column "added_year" cannot be restricted because the preceding column ("ColumnDefinition{name=title, type=org.apache.cassandra.db.marshal.UTF8Type, kind=PARTITION_KEY, componentIndex=0, indexName=null, indexType=null}") is either not restricted or is restricted by a non-EQ relation"

        SELECT * FROM videos_by_title_year WHERE title = 'Another Phone Test' ;
        InvalidRequest: code=2200 [Invalid query] message="Partition key part added_year must be restricted since preceding part is"

        SELECT * FROM videos_by_title_year WHERE added_year = 2015 AND title = 'Another Phone Test';

        title              | added_year | added_date               | description_text  | user_id                              | video_id
        --------------------+------------+--------------------------+-------------------+--------------------------------------+--------------------------------------
        Another Phone Test |       2015 | 2015-04-03 23:24:08+0000 | Hello phone test. | e2cccd94-7e49-479e-ae6b-e0a791591a29 | dbf264e6-0ef3-1c9a-abed-b0fd5246b8ff

        (1 rows)

### Explanation
#### Model
        CREATE TABLE videos (
            id int,
            name text,
            runtime int,
            year int,
            PRIMARY KEY (id)
        );

#### Data in table
| id | name | runtime | year |
| --- | --- | --- | --- |
| 1 | Insurgent | 119 | 2015 |
| 2 | Interstellar | 98 | 2014 |
| 3 | Mockingjay | 122 | 2014 | 

#### Representation

                  +---------------------------------+
        +---+     | |  name   | |runtime|  | year | |
        | 1 | --->|      V          V          V    |
        +---+     | |Insurgent| |  144  |  | 2015 | |
                  +---------------------------------+
                  +---------------------------------+
        +---+     | |  name   | |runtime|  | year | |
        | 2 | --->|      V          V          V    |
        +---+     | |Interstel| |   98  |  | 2014 | |
                  +---------------------------------+
                  +---------------------------------+
        +---+     | |  name   | |runtime|  | year | |
        | 3 | --->|      V          V          V    |
        +---+     | |Mockingja| |  122  |  | 2014 | |
                  +---------------------------------+

- Each row is a *partition*
- 1, 2, 3: *partition key*
- key-value pairs in a row: *cells* (e.g.: year:2015)
- this is how data is stored on disk
- *primary key* determines partitioning criteria (id in the example)
- partition: smallest unit of storage 
    - a single partition is not split up
    - an entire partition is stored on a single node
    - partitions are distributed across nodes
        - partition key is hashed to determine the node it is stored on
    - `WHERE` on a field other than partition key would require searching all partitions on every node
- *composite partition key*: `PRIMARY KEY ((name, year))`
    - double parentheses are on purpose, what follows the composite partition key are the *clustering keys*

## Exercise 4: Clustering Columns

- Allow queries by tag and year-range
- Order results by year

        CREATE TABLE videos_by_tag_year (
            tag text,
            added_year int,
            video_id timeuuid,
            added_date timestamp,
            description text,
            title text,
            user_id uuid,
            PRIMARY KEY ((tag), added_year, video_id)
        ) WITH CLUSTERING ORDER BY (added_year DESC);

- tag for partitioning
- added_year for clustering to allow range queries
- video_id to add uniqueness

        COPY videos_by_tag_year (
            tag, 
            added_year, 
            video_id, 
            added_date,
            description,
            title,
            user_id)
        FROM 'videos_by_tag_year.csv' 
        WITH HEADER=true;

        SELECT * FROM videos_by_tag_year WHERE tag = 'cql' AND added_year > 2013 ;
        works

        SELECT * FROM videos_by_tag_year WHERE added_year > 2013 ;
        InvalidRequest: code=2200 [Invalid query] message="Cannot execute this query as it might involve data filtering and thus may have unpredictable performance. If you want to execute this query despite the performance unpredictability, use ALLOW FILTERING"

### Explanation
#### Upserts
- if key is already present at an insert, Cassandra will do an upsert
- new value overwrites old value belonging to a key
- Cassandra does not read before a write - better performance
- there is a way to explicitly force a read before a write and report error instead of upsert
- upsert is the default behavior
- `UPDATE me_test SET me_value = 'I Love Upserts' WHERE me_key = 42;` has the same behavior as `INSERT`

#### Clustering Columns
        CREATE TABLE videos (
            id int,
            name text,
            runtime int,
            year int,
            PRIMARY KEY ((year), name)
        );

    - *clustering* columns come after *partition key* within `PRIMARY KEY` clause
    - `year`: partition key
    - `name`: clustering column

#### Data in table
| id | name | runtime | year |
| --- | --- | --- | --- |
| 1 | Insurgent | 119 | 2015 |
| 2 | Interstellar | 98 | 2014 |
| 3 | Mockingjay | 122 | 2014 | 

#### Representation

                     +------------------------------------------+--------------------------------------+
        +------+     | |interstellar:id| |interstellar:runtime| | |mockingjay:id| |mockingjay:runtime| |
        | 2014 | --->|         V                   V            |        V                 V           |
        +------+     | |       2       | |         98         | | |      3      | |       113        | |
                     +------------------------------------------+--------------------------------------+
                     +------------------------------------+
        +------+     | |insurgent:id| |insurgent:runtime| |
        | 2015 | --->|       V                 V          |
        +------+     | |     1      | |       119       | |
                     +------------------------------------+

- `year`: partition key
- `interstellar:id`: key in each cell becomes <clustering key>:<cell key>
- can say: 'I need all the videos produced in 2014'
- wide rows are stored as a hole, Cassandra will not break this up
- rows within a cluster is stored in sorted order

#### Querying Clustering Columns
- clustering columns are sorted
    - can do range on clustering columns (only)
    - can do binary search
- `SELECT * FROM videos WHERE year = 2014 AND name = 'mockingjay';
    - binary search within the partition with key 2014
- `SELECT * FROM videos WHERE year = 2014 AND name >= 'interstellar';
    - binary search within the partition with key 2014

## Exercise 5: ​Adding Tags and Video Encoding
- `TRUNCATE table1;` remove every row
- `ALTER TABLE table1 ADD another_column text;`
- `ALTER TABLE table1 DROP another_column;`
- cannot alter PRIMARY KEY!
- Collection columns: allows multiple values in a single cell
    - designed to store small amount of data
    - retrieved all at once
    - `SET<TEXT>`, `LIST<TEXT>`, `MAP<TEXT, INT>`
- *UDT*s: User Defined Types goups related fields of information
    - allows embedding more complex data within a single column
    - definition looks almost like a table definition


            CREATE TYPE address (
                street text,
                city text,
                zip_code int,
                phones set<text>
            );

            CREATE TYPE full_name (
                first_name text,
                last_name text
            );


- to use UDTs add the keyword `frozen`


            CREATE TABLE users (
                id uuid,
                name frozen <full_name>,
                direct_reports set<frozen <full_name>>,
                addresses map<text, frozen <address>>,
                PRIMARY KEY ((id))
            );

- NB! add values to a new column
    - with primary key and new values in separate csv files
    - e.g.: `COPY videos (video_id, encoding) FROM 'videos_encoding.csv' WITH HEADER = true;`
    - because of *upsert* will add new data, leave other fields untouched

## Exercise 6 – Counters
further data types

### Counters
- NB! native _int_ has concurrency issues
    - to update, would need to read, write back incremented value
    - Cassandra is distributed
    - race condition guaranteed
        

            CREATE TABLE moo_counts (
                cow_name text,
                moo_count counter,
                PRIMARY KEY ((cow_name))
            );

            UPDATE moo_counts
            SET moo_count = moo_count + 8
            WHERE cow_name = 'Betsy';

- NB! Counters can be incremented and decremented
- Counters cannot be directly assigned
- counters hold the value 0 when created
- counters must be the only non-partition key columns in the table
    - in other words: all non-counters must be part of the primary key!

### Sourcing files
- executes a file containing cql statements
- enclose file name in single quotes
- output for each statement appears in turn
- e.g.: `SOURCE './myscript.cql';`

## Exercise 7 – Denormalizing
- Denormalizing
- differing PRIMARY KEY structures

### Typical Relational Table Structure

videos

| id | title | runtime | year |
| --- | --- | --- | --- |
| 1 | Insurgent | 119 | 2015 |
| 2 | Interstellar | 98 | 2014 |
| 3 | Mockingjay | 122 | 2014 |

users

| id | login | name |
| --- | --- | --- |
| a | emotions | Mr. Emotional |
| b | clueless | Mr. Naive |
| c | noshow | Mr. Inactive |

comments

| id | user_id | video_id | comment |
| --- | --- | --- | --- |
| 1 | a | 1 | Loved it! |
| 2 | a | 3 | Hated it! |
| 3 | a | 2 | I cried at the end! |
| 4 | b | 2 | Someone stole my tissues... |

#### query comments by video title (SQL)
- comments on videos

        SELECT comment
        FROM videos JOIN comments
        ON videos.id = comments.video_id
        WHERE title = 'Interstellar'

result set

| id | title | runtime | year | id | user_id | video_id | comment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | Interstellar | 98 | 2014 | 3 | a | 2 | Icried at the end! |
| 2 | Interstellar | 98 | 2014 | 4 | b | 2 | Someone stole my tissues... |

- comments by user

        SELECT comment
        FROM users JOIN comments
        ON users.id = comments.user_id
        WHERE users.login = 'emotions'

### Cassandra's Aproach - Denormalizing
- Denormalizing for query performance
- Create multiple tables - the two tables differ in what we want to query by
    - NB! the partition key for the two tables are different
    - comments_by_video: 'Insurgent' -> comment
    - comments_by_user: 'noshow' -> comments
- to keep the two tables in sync, see batch statement


        CREATE TABLE comments_by_video (
            video_title text,
            comment_id timeuuid,
            user_id text,
            video_id timeuuid,
            comment text,
            PRIMARY KEY ((video_title), comment_id)
        );

        CREATE TABLE comments_by_user (
            user_login text,
            comment_id timeuuid,
            user_id text,
            video_id timeuuid,
            comment text,
            PRIMARY KEY ((user_login), comment_id)
        );

## Conceptual Data Modeling
- Chen Notation
- Formally: Entity-Relationship (ER) Model
    - entity types
    - relationship types
    - attribute types


            [Video]-----n-----<features/appears in>-----m------[Actor]
               |                    |                             |
               +-(url)              \-(character name)            \-(_name_)
               +-(description)                                        |
               +-(_id_)                                               +-(first name)
               +-((tags))                                             \-(last name)
               \-((genres))                                           

- `[...]`: entity type
- `<...>`: relationship type
- `---n---`: cardinality 0..inf
- `(...)`: attribute types - what do we want to track about the entity
    - NB! composite attribute type, e.g.: actor name
- `(_..._)`: key attribute (underlined)
- `((...))`: multi-valued attribute (double outline)


        [Video]---1---<<has>>---1---[[encoding]]
           |                             |
           +-(_id_)                      +-(height)
           \-(title)                     +-(width)
                                         +-(encoding)
                                         \-((bit rates))

- `[[...]]`: weak entity type: cannot exist without an identifying relationship to a string type
    - NB! encoding does not have a key
    - if an encoding does not have a video, the encoding entity has to be removed
- `<<...>>`: identifying relationship

## Relationship Keys
- Identifying relationship instances
    - depends on the cardinality of the relationship

### 1-1
- for 1-1 use either of the participating keys
- eg.: `[Movie]--1--<has>--1--[First Showing]`

### 1-n
- use the key of the 'many' side
    - video id in this example
- e.g.: user uploads video
- `[User(_id_)]--1--<uploads(timestamp)>--n--[Video(_id_)]`
- there will be many instances of user id
- video id, the entity sitting on the 'many' side of the relationship appears once

### m-n
- combine both entity keys
- `[Actor(_name_)]--m--<appears in>--n--[video(_id_)]`
- many actors can appear in the same movie
- an actor can appear in multiple movies
- in this example: (actor.name, video.id) identifies a relationship
- if the relationship has an attribute, it could also be part of the relationship key
    - e.g.: `[User(_id_)]--m--<rates(rating)>--n--[Video(_id_)]` can have the (key user.id, rates.rating, video.id)

## Hierarchy
- triangles indicate inheritance
    - e.g.: Full Video IS_A Video
    - Trailer IS_A Video
    - TV Show IS_A Full Video
    - Movie IS_A Full Video
- IS_A is transitive
- subtype inherits attrbutes from parent types

### constraints
- *disjoint*: object cannot participate in more than one subtype
    - eg.: a Full Video is either a TV-show or a Movie, but never both
- *covering*: like abstract in java
    - e.g. Full video and Trailer _cover_ all possible types of Videos in our domain
    - Tv-show and Movie do not cover all possible types, we need to use Full Video for the rest

## Application Workflow
- Application Workflow -> Access Patterns
- for the killrVideo example 
    - user logs into site
        - Q1: Find a user with a *specified email*
    - show latest videos added to the site
        - Q2: Find  most recently uploaded *videos*
    - show basic info about the user 
        - Q3: Find a user with a *specified id*
    - show videos added by a user
        - Q4: Find videos uploaded by a *user with a known id* (show most recently uploaded first)
    - show a video and its details
        - Q5: Find a video with a *specified video id*

## Mapping Conceptual to Logical
- Conceptual: ER-diagram + queries (access patterns)
- -> mapping rules -> logical data model
- NB! *query driven data modeling* - build tables that satisfy queries

### Chebotko diagrams

            |                                       |
            V Q1                                    V Q2
        +--------------------+             +----------------------+
        | users_by_email     |             | latest_videos        |
        +--------------------+        Q2   +----------------------+
        | email            K | ----------> | video_bucket      K  |
        | password           |             | upload_timestamp  C↓ |
        | user_id            |             | video_id          C↑ |
        +--------------------+             | title                |
                                           | type                 |
                                           | {tags}               |
                                           | <preview_thumbs>     |
                                           +----------------------+

        Access Patterns
        Q1: Find a user with a specified email
        Q2: Find most recently uploaded videos


                  |
                  V Q1
        +----------------------+          +----------------------+
        | videos               |          | actors_by_video      |
        +----------------------+     Q2   +----------------------+
        | video_id          K  | -------> | video_id          K  |
        | upload_timestamp     |          | (actor_name)      C↑ |
        | title                |          | character_name    C↑ |
        | description          |          +----------------------+
        | type                 |          
        | url                  |          +----------------------+ 
        | *encoding*           |          | *encoding*           |
        | {tags}               |          +----------------------+ 
        | <preview_thumbs>     |          | encoding             | 
        +----------------------+          | height               |
                                          | width                |
                                          | {bit_rates}          |
                                          +----------------------+ 

        Access Patterns
        Q1: Find a video with a specified video id
        Q2: Find actors for a video with a known id (show names in ascending order)

- Graphical representation of Cassandra database schema designed
- Documents logical and physical data model 
- For physical representation add types to the boxes
- Boxes: Table Diagrams
- Arrows: Application Workflows
    - Arrows in: Entry point
    - Arrow out: Transition
    - Query number next to arrow: One or more queries supported by a table
- Query List - helps determine what parts of the conceptual model has to be turned into tables
- `*encoding*`: UDT diagrams
- `K`: Partition key
- `C↑`: Clustering key ASC
- `C↓`: Clustering key DESC
- `S`: Static column
- `IDX`: Secondary index column
- `++`: Counter column
- `[column_name]`: list
- `{column_name}`: set
- `<column_name>`: map
- `*column_name*`: UDT column
- `(column_name)`: tuple column
    - similar to user defined types

## Logical - Principles
1. Know Your Data
2. Know Your Queries
3. Nest Data 
4. Duplicate Data 

### Know Your Data
- entities
- relationships
- attributes
- understand data
- primary keys: unique
    - formed to serve a query
    - the reason a table exists is to satisfy a particular query
    - entity and relationship keys affect the table primary keys
- a table is supposed to satisfy a query
    - add properties that are relevant to the query

### Know Your Queries
- Queries directly affect schema designed
- queries captured by application workflow model
- Table schea design changes is queries change
- Schema design organises data to efficiently run queries
    - *ideal*: Partition per query
    - *acceptable*: Partition+ per query
    - *anti-pattern*: Table scan
    - *anti-pattern*: Multi-table 

#### Partition per query
- the most efficient access pattern
- Query accesses only one partition to retrieve results
- Partition can be single row or multi row
- ~ constant time lookup from hash table

#### Partition+ per query
- less efficient access pattern, but not necessarily bad
- Query needs to access multiple partitions to retrieve results
- e.g.: give me genres: comedy, cartoon, drama

#### Table Scan and Multi-table
- Least affeicient query, avoid if possible
- query needs to access all partitions in a table(s) to retrive results
- `ALLOW FILTERING` does this
- NB! no joins in cassandra

### Nest Data
- Data nesting is the main modelling tool
- Nesting organizes multiple entities into a single prtition
- supports partition per query data access
- three data nesting mechanisms
    - Clustering columns - multi-row partitions
    - collection columns
    - user defined type columns

#### Clustering columns
- THE ideal nesting technique
- partition key identifies an entity that other entities will nest into
- Vaules in a clustering column identify the nested entities
- mutiple clustering columns implement multi-level nesting
- e.g.:

            +----------------------+
            | actors_by_video      |
            +----------------------+
            | video_id          K  |
            | (actor_name)      C↑ |
            | character_name    C↑ |
            +----------------------+

#### User Defined Types
- secondary data nesting mechanism
- represents one-to-one relationships
- easier to work with than multiple collection columns

### Duplicate Data
- it's better to duplicate data than to join data 
- data can be duplicated across tables, partitions, and rows
- time vs. space tradeoff - space is cheap
- cassandra does not support joins
    - no join by read (at query time)
    - we need to do join by write
        - see: videos_by_actor, videos_by_genre, videos_by_tag_year
        - we compose our tables by writing joined data
- data duplication can scale, joins cannot
    - one seek, one read, one stream, 
    
## Logical - Mapping rules
- mapping for query-driven methodology
- entities and relationships
- equality search attributes
- inequality search attributes
- ordering attributes
- key attributes

### MR1: Entities and relationships
- entity and relationship types map to tables
- entities and relationships map to partitions or rows
- partition may have data about one or more entities and relationships
- Attributes are represented by columns

        Conceptual model              Logical Model

        [User]                        +-----------------+
         |                            | Users           |
         +-(_id_)                     +-----------------+
         +-(first name)               | user_id       K |
         +-(last name)                | email           |
         +-(email)                    | first_name      |
         \-(registration date)        | last_name       |
                                      | reg_date        |
                                      +-----------------+

| user_id | email | first_name | last_name | reg_date |
| --- | --- | --- | --- | --- |
| a7e7... | jbellis@datastax.com | jonathan | ellis | 2010-04-04 00:00:00+0000 |

- each relationship becomes a row in the table
- relationship type attributes are represented by columns
- queries and relationship cardinality affects the design of the primary key

        [User]--1--<Uploads>--n--[Video]
         |                         |
         +-(_id_)                  +-(url)
         +-(email)                 +-(title)
         \-(...)                   +-(_id_)
                                   \-(...)

        +----------------+     +----------------+
        | videos_by_user |     | users_by_video |
        +----------------+     +----------------+
        | user_id      K |     | video_id     K |
        | video_id    C↑ |     | user_id        |
        | ...            |     | ...            |
        +----------------+     +----------------+

### MR2: Equality Search Attributes
- `WHERE` clause will have an equality condition in it
- Attributes we query on must be in the front of the primary key
- Primary key is an ordered set of columns, made up of partition key and clustering columns
- A partition key is formed by one or more of the leading primary key columns
- Supported queries must include all partition key columns in the query

        PRIMARY KEY ((partition_key1, partition_key2, ...), clustering_column1, clustering_column2, ...)

- example
    - Equality search attributes become initial columns of a primary key
    - Querying on `title` and `type`
    - NB! can also do EQUALS on clustering column


            [Video]      +----------------------+
            |            | videos_by_title_type |
            +-(_id_)     +----------------------+
            +-(title)    | title              K |
            +-(type)     | type               K |
                         | video_id          C↑ |
                         | ...                  |
                         +----------------------+

                         +----------------------+
                         | videos_by_title      |
                         +----------------------+
                         | title              K |
                         | type              C↑ |
                         | video_id          C↑ |
                         | ...                  |
                         +----------------------+

                         +----------------------+
                         | videos_by_type       |
                         +----------------------+
                         | type               K |
                         | title             C↑ |
                         | video_id          C↑ |
                         | ...                  |
                         +----------------------+

### MR3: Inequality Search Attributes
- GREATER THAN, LESS THAN
- Inequality search attributes become clustering columns
- columns involved in inequality searches must come after columns used in equality searches
    - cannot add an equals after a less than
- example
    - querying on `last_name = ? and registration_date > ?`
    - `last_name K`
    - `registration_date C↑`
    - `user_id C↑` makes the key unique

### MR4: Ordering Attributes
- Ordering attributes map to clustering columns
- in each partition, CQL rows are ordered based on clustering columns
- in ASC or DESC
- `PRIMARY KEY ((partition_key1, partition_key2, ...), clustering_column1, clustering_column2, ...) ORDER BY clustering_column1 ASC, clustering_column2 DESC, ...`
- you have to know at design time what you want to order on

### MR5: Key Attributes
- Key attributes map to primary key columns
- primary key must include columns that represent key attributes
- Position and order of such columns may vary 
- Primary key may have additional columns to support specific queries
- violating this rule may result in upsert operations - loss of data
- example
    - users table - query by user_id
        - `user_id K`
    - users_by_name table - query by name
        - `last_name K`
        - `first_name K`
        - `user_id C↑` guarantees uniqueness

### Example

        [User]-----1-----<Uploads>-----n------[Video]
         |                |                    |
         +-(_id_)         \-(timestamp)        +-(_id_)
         +-(last_name)                         +-(description)
         +-(first_name)                        \-(title)
         \-(email)

         Q: user_id = ? and uploaded_timestamp > ? ORDER BY uploaded_timestamp DESC

         MR1: Convert entity to a table, mapped attributes of entities and relationships into columns
                +-----------------------+
           MR1  | videos_by_user        |
         -----> +-----------------------+
                | user_id               |
                | uploaded_timestamp    |  
                | video_id              |  
                | email                 |  
                | first_name            |  
                | last_name             |  
                | title                 |  
                | description           |  
                +-----------------------+ 

        MR2: All equality search attributes must come first in the primary key
                +-----------------------+
          MR2   | videos_by_user        |
         -----> +-----------------------+
                | user_id             K |
                | uploaded_timestamp    |
                | video_id              |
                | email                 |
                | first_name            |
                | last_name             |
                | title                 |
                | description           |
                +-----------------------+                 

        MR3: Inequality search attributes follow equality search attributes
                +-----------------------+
           MR3  | videos_by_user        |
         -----> +-----------------------+
                | user_id             K |
                | uploaded_timestamp  C↑|  
                | video_id              |  
                | email                 |  
                | first_name            |  
                | last_name             |  
                | title                 |  
                | description           |  
                +-----------------------+  

         MR4: make sure the sorting is in the right order
                +-----------------------+
          MR4   | videos_by_user        |
         -----> +-----------------------+
                | user_id             K |
                | uploaded_timestamp  C↓|
                | video_id              |
                | email                 |
                | first_name            |
                | last_name             |
                | title                 |
                | description           |
                +-----------------------+

         MR5: We must include the key of the relationship in the primary key
                +-----------------------+
          MR5   | videos_by_user        |
         -----> +-----------------------+
                | user_id             K |
                | uploaded_timestamp  C↓|
                | video_id            C↑|
                | email                 |
                | first_name            |
                | last_name             |
                | title                 |
                | description           |
                +-----------------------+

## Exercise 11: Extend The KillrVideo Logical Model