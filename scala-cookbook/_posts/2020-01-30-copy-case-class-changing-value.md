---
layout: post
title:  "Copy Case Class While Changing Some Values"
date:   2020-01-30 15:37:54 +0200
categories: scala cookbook tips&tricks
---

One of the built in features of case classes is to make a copy while changing some of its fields:

`#copy(argument = new value, ...)`

## Example

```scala
case class Foo(bar: String, baz: String)

val foo = Foo(
  bar = "bar",
  baz = "baz"
)

val differentFoo = foo.copy(baz = "qux")
```
