---
layout: post
title:  "TITLE"
date:   2020-01-30 15:37:54 +0200
categories: scala cookbook tips&tricks
---

`WSClient` is normylly injected by Guice. It is also possible to instantiate it manually:

```scala
import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import org.scalatest.WordSpec
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.time.{Millis, Seconds, Span}
import play.api.libs.ws.ahc.AhcWSClient

import scala.concurrent.Await
import scala.concurrent.duration._

class WsTest extends WordSpec with ScalaFutures {

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  val ws = AhcWSClient()

  implicit val defaultPatience = PatienceConfig(
    timeout = Span(10, Seconds),
    interval = Span(5, Seconds))

  "foo" can {
    "bar" should {
      "qux" in {
        val response = ws.url("http://httpbin.org/get?foo=bar").get()

        whenReady(response) { r =>
          println(r)
        }
      }
    }
  }
}
```

## Source

[documentation](https://www.playframework.com/documentation/2.7.x/ScalaWS)
