---
layout: post
title:  "TIL: RUN / CMD / ENTRYPOINT"
date:   2017-08-30 15:37:54 +0200
categories: til docker
---

## Shell Form

- `RUN | CMD | ENTRYPOINT <command> <params>`
- under the hood it calls `/bin/sh -c <command> <params>`
- handles variable substitution, e.g.


        ENV name world
        CMD echo "Hello, ${name}!"

## Exec Form

- `RUN | CMD | ENTRYPOINT ["<executable>", "<param>", "<param>", ...]`
- preferred over shell form for `CMD` and `ENTRYPOINT`
    - calls executable directly
    - no shell processing
    - no variable substitution
- explicit variable substitution


        ENV name world!
        CMD ["/bin/bash", "-c", "echo", "Hello, ${world}!"]

## RUN 
- executes commands in a new layer and creates a new image

## CMD 
- sets default command
- default command is executed when running container without specifying a command
    - e.g.: `$ docker run -it --rm busybox` runs `CMD ["command", "param1", "param2"]`
- can be overwritten from command line when docker container runs
    - default command in this case is ignored
    - e.g.: `$ docker run -it --rm busybox /bin/sh`
- sets default parameters when used with `ENTRYPOINT`
    - e.g.: `CMD ["param1", "param2"]`
    
## ENTRYPOINT 
- configures a container that will run as an executable
- use to always execute a command 
- _additionaly_ use `CMD` to define such extra default arguments, which can be overwritten from command line
- `ENTRYPOINT` commands are always used, regardless of how the container is run, e.g.:

        ENTRYPOINT ["/bin/echo", "Hello, "]
        CMD ["world"]

        $ docker run --rm test-container
        > Hello, world

        $ docker run --rem test-container John
        > Hello, John

- in exec form `CMD` params and docker run command line arguments are added
- in shell form both are ignored

## Source
http://goinbigdata.com/docker-run-vs-cmd-vs-entrypoint/