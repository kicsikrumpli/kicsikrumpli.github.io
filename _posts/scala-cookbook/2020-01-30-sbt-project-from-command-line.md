---
layout: post
title:  "Run Sbt Command Non-Interactively"
date:   2020-01-30 08:00:00 +0200
categories: scala cookbook
---

Instead of using sbt in interactive mode:

## Prefix Command with Project Name

`sbt myproject/test`

## Quote Parameters

Useful for example when we want to pass a different port to `run`

`sbt "project myproject" "run 9001"`
