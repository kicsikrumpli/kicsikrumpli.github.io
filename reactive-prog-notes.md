# Reactive programming
[source](https://class.coursera.org/reactive-002/lecture)

# Week 1
## What is Reactive Programming
event driven:
- reacts to loads - scalable
- react to failures - resilient
- react to users - responsive

### Event driven
- loosely coupled event handlers
- asynchronous

### Scalable
able to be expanded according to usage
scale up: make use of parallelism
  - important: minimize shared mutable state

scale out: make use of multiple server nodes
  - important: location transparency
  - resilience

### Resilience
- Needs to be part of system design
- looseley coupled components
- strong encapsulation of state

failures can be:
  - software failure
  - hardware failure
  - connection failure

### Responsive
provides rich, real time interaction with users even under load and presence of failures

### Event handling
Traditionally done with callbacks

    class Counter exetnds ActionListener {
      private var count = 0
      button.addActionListener(this)

      def actionPerformed(e: ActionEvent): Unit = {
        count += 1
      }
    }

callback registers itself with button

problems with this model:
  - side effect of callback - leads to shared mutable state
  - cannot be composed
  - leads to "callback-hell" - web of callbacks

solution: composable event abstractions
  - events should be first class
  - events represented as mesages
  - event ahndlers are also first class
  - complex handlers can be composed from primitives

## Functions and Pattern Matching
### Example Json

    {
      "firstName" : "John",
      "lastName" : "Smith",
      "address" : {
        "street" : "21 2nd str",
        "state" : "NY",
        "postCode" : "10021"
      },
      "phoneNumbers" : [
        {"type: "home", "number" : "212 555-1234"},
        {"type: "fax", "number" : "646 555-4567"}
      ]
    }

### How to represent this in Scala?

    abstract class JSON
+ Sequence of Json Objects
      case class JSeq (elements: List[JSON]) extends JSON
+ Map binding field names to their values
      case class JObj (bindings: Map[String, JSON]) extends JSON
+ Primitive types
      case class JNum (num: Double) extends JSON
      case class JStr (str: String) extends JSON
      case class JBool (b: Boolean) extends JSON
      case object JNull extends JSON

> Case classes are regular classes which export their constructor parameters and which provide a recursive decomposition mechanism via *pattern matching*.
[scala doc](http://docs.scala-lang.org/tutorials/tour/case-classes.html)

Same class in Scala

    val data = JObj(Map(
        "firstName" -> JStr("John"),
        "lastName" -> JStr("Smith"),
        "address" -> JObj(Map(
            "address" -> JStr("21 2nd street"),
            "state" -> JStr("NY"),
            "postCode" -> JStr("10021")
        )),
        "phoneNumbers" -> JSeq(List(
            JObj(Map("type" -> JStr("home"), "number" -> JStr("212 555-1234"))),
            JObj(Map("type" -> JStr("fax"), "number" -> JStr("646 555-4567")))
        ))
    ))

### Printing Json object with pattern matching

    def show(json : JSON): String = json match {
      case JSeq(elems) =>
        "[" + (elems map show mkString ", ") + "]"
      case JObj(bindings) =>
        val assoc = bindings map {
          case (key, value) => '\"' + key + '\":' show(value)
        }
        "{" + (assocs mkString ", ") + "}"
      case JNum(num) => num.toString
      case JStr(str) => '\"' + str + '\"'
      case JBool(b) => b.toString
      case JNull => "null"
    }

`mkString`: make String function
`assocs mkString ", "` concatenates elements of `assocs` into a String

What is the type of `{ case (key, value) => key + ": " value }`? Taken by itself the expression does not stand,
we need a type expected by `map`, such as `JBinding => String`, where

    type JBinding = (String, JSON)

**NB!** `JBinding => String` is just a shorthand for `scala.Function1[JBinding, String]`

### Function1 Trait

    trait Function1[-A, +R] {
      def Apply(x: A): R
    }

Thus the pattern matching block `{ case (key, value) => key + ": " value }` expands to

    new Function1[JBinding, String] {
      def apply(x: JBinding) = x match {
        case (key, value) => key + ": " value
      }
    }

### Maps
Scala maps are also functions from keys to values

    trait Map[Key, Value] extends (key => Value)

### Sequences
Sequences are also functions from Int indices to values

    trait Seq[Elem] extends (Int => Elem)

That's why elems(i) can be written for indexing.

### Partial Functions
    val f: String = > String = {case "ping" => "pong"}

returns match error when if function if not applicable for given argument

    f("ping") // res0: String => "pong"
    f("abc")  // scala.MatchError

This is solved by Partial Functions:

    val f: PartialFunction[String, String] = {case "ping" => "pong"}

    f.isDefinedAt("ping")   // true
    f.isDefinedAt("abc")    // false

PartialFunction Trait is defined as:

    trait PartialFunction[-A, +R] extends Function1[-A, +R] {
      def apply(x: A): R
      def isDefinedAt(x: A): R
    }

In case of a PartialFunction `{case "ping" => "pong"}` is expanded by the compiler as

  new PartialFunction[String, String] {
    def apply(x: String) = x match {
      case "ping" => "pong"
    }
    def isDefinedAt(x: String) = x match {
      case "ping" => true
      case _ => false
    }
  }

**NB!** isDefinedAt looks at the outmost pattern match only, not nested ones.

## Collections

    Iterable
      |
      +-- Seq
      |   |
      |   +-- IndexedSeq
      |   |   |
      |   |   +-- Vector
      |   |   +-- (Java Array)
      |   |   \-- (Java String)
      |   |
      |   \-- LinearSeq
      |       |
      |       \-- List
      |
      +-- Set
      \-- Map

Every collection shares the methods
+ map
+ flatMap
+ filter
+ **foldLeft**
+ **foldRight**

### map

    abstract class List[+T] {
      def map[U](f: T => U) : List[U] = this match {
        case x :: xs = f(x) :: xs.map(f)
        case Nil => Nil
      }
    }

### flatMap

    abstract class List[+T] {
      def flatMap[U](f: T => List[U]) : List[U] = this match {
        case x :: xs = f(x) ++ xs.map(f)
        case Nil => Nil
      }
    }

**NB!** :: cons, ++ concatenate

### map vs. flatMap
from ((1,2,3), (4,5,6)) with (x => x*x)
+ map: ((1, 4, 9), (16, 25, 36)))
+ flatMap: (1, 4, 9, 16, 25, 36)

### filter

    abstract class List[+T] {
      def filter[U](f: T => Boolean) : List[U] = this match {
        case x :: xs = if (p(x)) x :: xs.filter(p) else xs.filter(p)
        case Nil => Nil
      }
    }

**NB!** Actual implementations are different - more general, tail recursive

### For-Expressions
Simplify combinations of core methods map, flatMap, filter.

Instead of

    (1 until n) flatMap (i =>
      (1 until i) filter (j => isPrime(i + j) map
        (j => (i, j))
      )
    )

we can write

    for {
      i <- 1 until n
      j <- 1 until i
      if isPrime(i + j)
    } yield (i, j)

--- midway of lesson ---

## Functional Random Generators

## Monads

# Week 2

## Functions and State

## Identity Change

## Loops

## Discrete Event Simulation

## Discrete Event Simulation API

## Discrete Event Simulation Implementation and Test

## Imperative Event Handling: Observer Pattern

## Functional Reactive Programming (FRP)

## A Simple FRP Implementation
