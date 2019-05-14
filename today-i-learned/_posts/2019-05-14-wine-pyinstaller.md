---
layout: post
title:  "TIL: Pyinstaller on Wine"
date:   2019-05-14 15:37:54 +0200
categories: til docker wine pyinstaller python
---

## Problem

Have a python script that has to be deployed to a Windows machine in a portable manner. Internet access is likely limited, installing the Python runtime and pulling dependencies vie Pip is out of the question; so is installing Docker. Sounds trivial, right?

## Tl;dr

I created a [Docker container](https://hub.docker.com/r/kicsikrumpli/wine-pyinstaller) that packages 3.x python scripts into 32-bit Windows executables with pyinstaller.

## Development Chronicle

### I bet Python is portable out of the box

- venv
    - nope, it's not a tool for portability
    - can't even drop it into a different folder, let alone a different host
- portable python runtime
    - too much hand cranking

### Maybe an external packaging tool then

- pyinstaller
    - no cross compiles
        - there used to be, but it was unstable
    - I bet somebody already solved this problem
        - they fail
        - they are all for python 2.x
            - why? because there is no gui-less installer for Python 3.x, only for 2.x
                - msi installer unnecessarily ask for elevated permissions

### Let's roll our own

    - let's roll our own
        - ubuntu base, apt install wine, wine python-3.7.3.exe – fail
            -foo foo foo
            - apt install wine-stable; installs wine 3.0
                - insult to injury: 64 bit wine which is not so stable according to the interwebs
                > it looks like wine32 is missing, you should install it. multiarch needs to be enabled first.  as root, please execute "dpkg --add-architecture i386 && apt-get update && apt-get install wine32" wine-3.0 (Ubuntu 3.0-1ubuntu1)
                - let's do it again, apt install wine32... blargh
                - yiss, wine --version works
            - python 3.7 installer makes some unimplemented dll calls
            - google-fu: python 3.5 still works
                - wine and Python installer can be forced to play nice if you mix and match just the right versions
                - there is no officially downloadable Python 3.5 installer
                - not gonna downgrade...
            - some more google foo: wine 4.0-rc1 has the missing dll calls
                - oops, there is no binary, need to compile from source

### BYORH – Bring Your Own Rabbit Hole

    *Alice in wonderland rabbit hole*
    - compile wine 4.7 from source
        - 64 bit wine doesn't play nice with Python
        - cannot cross-compile 32 bit wine on 64 bit platform
            - https://bugs.launchpad.net/ubuntu/+source/wine1.4/+bug/944321
            - some voodoo here: https://askubuntu.com/questions/123273/installing-wine-1-5-configure-error-cannot-build-a-32-bit-program-you-need-t/326499
                - spolier: they don't work
            - 32 and 64 bit development files cannot coexist on the same machine
            - FROM: i386/ubuntu
        - all the dependencies are missing :O
            - gather them by hand? oh no, no, no, nononono
            - let's go spellunking on google
                - ritual sacrifice...no!
                - burning hoops...no!
                - magic incantations, endless copypaste apt install-s...no
            - yay! apt build-dep wine \o/
                - https://askubuntu.com/questions/158871/how-do-i-enable-the-source-code-repositories
                - don't forget to enable source repositories first
            - ain't that nice, but you still need flex bison gcc and build-essentials, *mkay*?
        - configure - make - make install
            - wait
            - make coffee
            - create spinny wheel emoticon for team slack
            - still compiling... wink-wink xkcd

### Chemical X

    - yay, wine is installed
        - Installed means it's done, right? ummm, wineprefix? so you need to winecfg too
        - wine: where is your x server? I can't live without X! give me X, or else. fail.
            - are you kidding me? how am I supposed to get an X server in a headless ubuntu image?
            - run a vnc server in ubuntu, connect to it from host?
                - https://stackoverflow.com/questions/36221215/using-vncserver-gui-application-virtual-display-in-docker-container
                - one, it's overkill
                - two, how am I gonna automate this?
                - three, alright, fine... smh
                - mac os screen Sharing disconnects instantly
            - run XQuartz on host, connect remotely
                - someone did that already, there are a number of moving parts, but ok
                    - https://medium.com/@mreichelt/how-to-show-x11-windows-within-docker-on-mac-50759f4b65cb
                    - (on host !) xhost + 127.0.0.1
                    - export DISPLAY=host.docker.internal:0
                - todo! replace xquartz with something headless
        - isn't that nice
            - not quite
            - Mono is missing, dou you want to install it? OK, Cancel
                - how on earth am I gonna automate this? 
                - click manually for now, let this be tomorrow me's problem
            - Gecko is missing. Install? Ok, Cancel
                - blaaargh
            - Wine Configuration
                - control panel style window, dismiss with OK to finish configuration
        - wine python-3.7.3.exe
            - install gui, next, next, install
            - wine python --version
                - yiss, a working windows python environment
                - are we there yet? Not quite...

### automate the clickety-clackety

    - automate the clickety-clackety
        - https://superuser.com/questions/978864/how-to-perform-unattended-installation-for-any-installer-using-wine
        - xdotool
        - YoU nEEd to EnaBle XTesT...
    - everything works fine when I autoclick, but not when docker build drives the scripts
        - I am at a loss, it seems that the container created manually is different from the one build from Dockerfile
        - rummaging through random github issues: https://github.com/moby/moby/issues/12795
        - I wasn't looking for anything specific to wine; guess what the github isshue is about! :D
        - it's easy to explain after the fact: wineserver keeps writing stuff to disk on winecfg, but docker believes it's done with the step
            - we need to wait for that sneaky bastard process to finish...

### do loose your head

    *beetlejuice gif*
    - switch to a headless X server
        - Xvfb
        - config fails again
            - same spiel? launch Xvfb, then wait until it's available?
                - https://askubuntu.com/questions/60586/how-to-check-if-xvfb-is-already-running-on-display-0
                - nope, it's there instantly
            - what's this fixme:event:wait_for_withdrawn_state timed out?
                - much google such bugs so red hering
            - trial, error, xdotool man page, and sheer luck
                - bunch of unsupported X commands
                    - is it on the right screen
                    - can it be unmapped and mapped again
                        - silly X-ism for makingi it invisible and visible again?
                    - how many screens do we have?
                - is xvfb-run better than manually launching and shutting down xvfb?
                    - shutting it down? rofl, this is a docker container :D
                - there seems to be no way to bring window out of withdrawn state
                - what if this is a race condition
                    - there must be a reason for xdotool search --sync
                    - Bob's your (weird) uncle
