---
layout: post
title:  "Map with Either Type"
date:   2020-01-30 15:37:54 +0200
categories: scala cookbook tips&tricks
---

> Either is right-biased, which means that Right is assumed to be the default case to operate on. If it is Left, operations like map, flatMap, ... return the Left value unchanged

```scala
Right(12).map(_ * 2) // Right(24)
Left(23).map(_ * 2)  // Left(23)
```

[scala docs](https://www.scala-lang.org/api/2.12.0/scala/util/Either.html)