---
layout: post
title:  "TITLE"
date:   2020-01-30 15:37:54 +0200
categories: scala cookbook tips&tricks
---

Instead of using sbt in interactive mode:

## Prefix Command with Project Name

`sbt myproject/test`

## Quote Parameters

Useful for example when we want to pass a different port to `run`

`sbt "project myproject" "run 9001"`
