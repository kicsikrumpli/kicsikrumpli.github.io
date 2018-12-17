---
layout: post
title:  "TIL: Optional Monad in Java"
date:   2018-12-15 15:37:54 +0200
categories: til optional monad
---

## Instead of this

```
public Optional<Integer> maybeAdd(Optional<Integer> a, Optional<Integer> b) {
    if (a.isPresent() && b.isPresent()) {
        return Optional.of(a.get() + b.get());
    } else {
        return Optional.empty();
    }
}
```

## Compose like this

```
public Optional<Integer> maybeAddMindBlown(Optional<Integer> a, Optional<Integer> b) {
    return 
        a.flatmap(one ->
        b.flatmap(two ->
        Optional.of(one + two)
        ));
}
```
