---
layout: post
title:  "TIL: Data Volumes"
date:   2017-08-30 15:37:54 +0200
categories: til docker
---

## DRAFT
docker volumes / data volumes / named volumes
https://boxboat.com/2016/06/18/docker-data-containers-and-named-volumes/
https://docs.docker.com/engine/tutorials/dockervolumes/

> Data volumes are designed to persist data, independent of the container’s life cycle. Docker therefore never automatically deletes volumes when you remove a container, nor will it “garbage collect” volumes that are no longer referenced by a container.

Use data container to bind volume to container

    $ docker run -v [{host-source}:]{container-mount-point} ...

    host-source: - an absolute path, e.g.: /foo
                    binds /foo on host to {container-mount-point}
                    on docker machine: 
                        - directory in user home is shared directly
                        - other mounted directories are shared from inside virtualbox
                 - OR a name, e.g.: foo
                    creates a named volume

    container-mount-point: an absolute path, e.g.: '/src/docs'
                > If the path /webapp already exists inside the container’s image, the /src/webapp mount overlays but does not remove the pre-existing content. Once the mount is removed, the content is accessible again. This is consistent with the expected behavior of the mount command.

    mount a single file or a directory

Bind volume in Dockerfile

    VOLUME {name}

    name: volume name 
        NB! dockerfile has to be portable, cannot mount host directory because that's host dependent

Create a named volume (preferred alternative to data containers)

    $ docker volume create my-named-volume
    $ docker run -it --rm -v my-named-volume:/foo busybox

Create data container

    $ docker create -v {container-mount-point} --name {data-container-name}
    $ docker run -volumes-from {data-container-name} ...

Find volumes

    $ docker inspect {container}

---
Automatically created environment variables
    HOME	    Set based on the value of USER
    HOSTNAME	The hostname associated with the container
    PATH	    Includes popular directories, such as :/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    TERM	    xterm if the container is allocated a pseudo-TTY

---
docker data containers
https://medium.com/@ramangupta/why-docker-data-containers-are-good-589b3c6c749e#.l3w01mcxg
example

    $ docker run -v /foo 
                --name="vtest" 
                busybox 
                sh -c 'echo hello docker volume > /foo/testing.txt'
    
    ---

    $ docker run --volumes-from=vtest 
                busybox 
                cat /foo/testing.txt

