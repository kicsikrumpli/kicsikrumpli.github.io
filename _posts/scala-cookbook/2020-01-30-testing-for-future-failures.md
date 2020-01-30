---
layout: post
title:  "Testing for Future Failures"
date:   2020-01-30 08:00:00 +0200
categories: scala cookbook
---

- Use ScalaFutures mixin
- whenReady
- when testing for failure pass futureValue.failure to whenReady

```scala
class FooTest extends WordSpec with MustMatchers with MockitoSugar with ScalaFutures {
...
  "Foo" can {
    "doSomething" should {
      "fail when something goes wrong" in {
        when(mockDependency.getQux(any[Bar], anyString()))
          .thenReturn(Future.successful(None))

        val result = doSomething(testCommand)

        whenReady(result.failed) { exception =>
          exception mustBe an [Exception]
        }
      }
    }
  }
}
```
