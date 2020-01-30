---
layout: post
title:  "Mix and Match with Mockito"
date:   2020-01-30 15:37:54 +0200
categories: scala cookbook tips&tricks
---

Although concrete values and matchers cannot be mixed, it is possible to use a matcher for exact values:

```scala
verify(mock).doSomething(
  withFoo = any[Foo],
  withBar = ArgumentMatchers.eq("this is a concrete value to verify"),
  withBaz = ArgumentMatchers.any[Map[String, String]],
  withQux = anyString())
```
