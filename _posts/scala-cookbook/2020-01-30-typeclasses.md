---
layout: post
title:  "Type Classes"
date:   2020-01-30 15:37:54 +0200
categories: scala cookbook
---

Type classes are a generic traits, hat allow attaching interfaces to types. Allows for

- ad hoc polymorphism
- type enrichment

## Type Classes with Type Parameters

### Generic Trait

```scala
trait ReversibleWithTypeParam[A] {
  def reverse(x: A): A
}
```

### Type Specific Implementations

```scala
implicit object IntReversible1 extends ReversibleWithTypeParam[Int] {
  override def reverse(x: Int): Int = x.toString.reverse.toInt
}

implicit object StringReversible1 extends ReversibleWithTypeParam[String] {
  override def reverse(x: String): String = x.reverse
}
```

### Usage

Concrete implementation can be used via implicit parameters:

```scala
object Reverser1A {
  def reverse[T](x: T)(implicit reversible: ReversibleWithTypeParam[T]): T =
    reversible.reverse(x)
}
...
println(Reverser1A.reverse(42))
println(Reverser1A.revers("reverse me!"))
```

Or via _Context Bounds_:

```scala
object Reverser1B {
  def reverse[T: ReversibleWithTypeParam](x: T) = implicitly[ReversibleWithTypeParam[T]].reverse(x)
}
...
println(Reverser1B.reverse(42))
println(Reverser1B.revers("reverse me!"))
```

#### Context Bounds

- Context Bounds Notation: `[T: ReversibleWithTypeParam]`
- Meaning:
  - there exists an _implicit_ value
  - of type `ReversibleWithTypeParam`
  - with a type parameter `T`
- `implicitly[...]` gives the concrete implicit istance

## Type Classes with Type Members

Type members are an alternative way for parametrizing abstract classes with types.

### Generic Trait

```scala
trait ReversibleWithTypeMember {
  type A
  def reverse(x: A): A
}
```

### Type Specific Implementations

```scala
implicit object IntReversible2 extends ReversibleWithTypeMember {
  type A = Int
  override def reverse(x: Int): Int = x.toString.reverse.toInt
}

implicit object StringReversible2 extends ReversibleWithTypeMember {
  type A = String
  override def reverse(x: String): String = x.reverse
}

```

### Usage

```scala
object Reverser2A {
  def reverse[T](x: T)(implicit reversible2: Reversible2 {type A = T}): T =
    reversible2.reverse(x)
}
...
println(Reverser2A.reverse(42))
println(Reverser2A.revers("reverse me!"))
```

NB! Context Bounds cannot be used with type members

## Type Enrichment via Implicit Conversion

Instead of invoking `Reverser` explicitly, the parameter can be implicitly converted to a type that has a `reverse` method.

```scala
implicit class FlipOps[T](val x: T) {
  def flip(implicit reversible1: Reversible1[T]): T = reversible1.reverse(x)
}
...
println("foo".flip)
println(123.flip)
```

## Sources

- [examples](https://www.geekabyte.io/2017/12/common-forms-of-type-class-pattern-in.html)
- [context bounds](https://docs.scala-lang.org/tutorials/FAQ/context-bounds.html)
