---
layout: post
title:  "TIL: Pyinstaller on Wine"
date:   2019-05-13 15:37:54 +0200
categories: til docker wine pyinstaller python
---

## Problem

Have a python script that has to be deployed to a Windows machine in a portable manner. Internet access is likely limited, installing Python runtime and pulling dependencies via Pip is out of the question; so is installing Docker. Trivial, right?

![this is not wine]({{ site.url }}/img/2019-05-13-wine-pyinstaller/this-is-not-wine.gif)

## Tl;dr

I created a [Docker container](https://hub.docker.com/r/kicsikrumpli/wine-pyinstaller) that packages 3.x python scripts into 32-bit Windows executables with Pyinstaller.

## Development Chronicle

Had I been wise, I would have cut my losses and left halfways. In hindsight this is a niche tool with too many moving parts; far more, than there should be. By no means do I claim, that this isn't overkill; yet morbid curiosity kept me from abandoning it. This is the chronicle of assembling all the pieces with duct tape and patience. Or maybe it's just the story of vanilla flavoured hubris of 'how hard can it be'-s and 'what could go wrong'-s. Either way: follow me, Reader!

### Python is portable out of the box, right?

![out of the box]({{ site.url }}/img/2019-05-13-wine-pyinstaller/cats-cats-cats.gif)

Being new to Python, I thought virtual environment is a means of portability in Pythonland (Pythonia?). My naivety is rooted in my familiarity with Maven, where dependency hell takes a different form. After some light research it is now clear, that venvs are meant for something else; so much so, that they cannot be dropped into different directories, let alone expect them to bear runtimes of multiple platforms.

What about the portable distribution of Python? In retrospect that might have been a good alternative with a substantial amount of hand cranking. That's an approach for next time.

### There must be an existing packaging tool

Googling led me to Pyinstaller. It does ~~exactly~~ almost what I need: it used to support cross compilation, but it had always been flaky apparently, hence the feature had since been dropped. Yet I  want to make Windows executables on linux.

No worries, Docker to the rescue! I am sure that I am not the first person to have come accross this problem. A solution must exist somewhere in the wild. The setup to look for is Ubuntu containerized with Wine and Python for Windows installed. Some exist, but none seem to work. To add insult to injury, they all seemed to have Python 2.x runtimes.

The prevalence of Python 2.x is easy to explain: unlike 3.x, it's distributed with an msi installer lending itself easily to gui-less unattended installs. In contrast 3.x only has a gooey installer, which displays a dialog box even in silent non-interactive mode.

### I roll my own

![eye roll]({{ site.url }}/img/2019-05-13-wine-pyinstaller/eye-roll.gif)

How hard could it be to roll my own? An afternoon, tops, right? Right?? It's as easy as taking an Ubuntu base image, apt install wine, wine python-3.7.3.exe. Why wouldn't this work... No seriously, why wouldn't this work – as in it definitely doesn't.

`apt install wine-stable` installs 64-bit wine; upon querying the version number a most helpful help message helps:

> it looks like wine32 is missing, you should install it. multiarch needs to be enabled first.  as root, please execute "dpkg --add-architecture i386 && apt-get update && apt-get install wine32

It LoOks LiKe blaBLabLa iS MisSinG... Ok! That's better, a working copy of wine version 3.0. Unfortunately it doesn't implement a number of dll calls, without which Python 3.5 install fine, but not 3.7. Yet only the latter is distributed officially. It's a matter of mixing and matching the right version numbers, but that's only feasible if we don't want to stick to official sources. One sudden turn of events after another. Except Bobby Ewing is not gonna wake up.

Fortunately wine 4.0-rc1 is rumored to solve this particular issue. Only caveat is that it has to built from source. The saga continues...

### BYORH – Bring Your Own Rabbit Hole

![down the rabbit hole]({{ site.url }}/img/2019-05-13-wine-pyinstaller/rabbit-hole.gif)

Deeper into the rabbit hole! Compile Wine 4.7 from sources. 64 bit wine doesn't play nice with Python. Cross compiling for 32 bit target is [virtually](https://bugs.launchpad.net/ubuntu/+source/wine1.4/+bug/944321) [impossible](installing-wine-1-5-configure-error-cannot-build-a-32-bit-program-you-need-t/326499) even after some suggested [voodoo](https://askubuntu.com/questions/123273/). In a nutshell 32 bit and 64 bit development files cannot coexist on the same system. No worries: `FROM i386/ubuntu`.

Missing dependency drama: much to no surprise at all, the web is full of well meaning bad ideas. Gathering build time dependencies by hand (like animals) is one of them. Spellunking on google reveals various bits of ritual sacrifices, burning hoops to jump through, magic incantations, and endless apt install-s to copypaste. Don't fall for any of them, the answer is deceivingly simple: [enable source code repositories](https://askubuntu.com/questions/158871/how-do-i-enable-the-source-code-repositories) with

- `sed -i '/deb-src/s/^# //' /etc/apt/sources.list && apt update` and
- `apt build-dep wine`

That's it. Yay \o/! Oh, you also need flex, bison, gcc, and build-essentials. *Mkay*? According to the [readme](https://github.com/wine-mirror/wine/blob/master/README) it's only a matter of

- `./configure`
- `make`
- wait
- make coffee
- create spinny wheel emoticon for team slack
- still [compiling](https://xkcd.com/303/)
- `make install`

### Chemical X

![chemical X]({{ site.url }}/img/2019-05-13-wine-pyinstaller/chemical-x.gif)

Wine is installed. Again. This time for real. If you can accept that *installed* lends itself to a wide variety of definitions. Copied to its place? Yes. Configured and ready to use? Not quite. Wine supports multiple configurations, or wine prefixes. Before wine can be put to use, `winecfg` has to be run. And winecfg is picky:

- Where is your x server? I can't live without X! Give me X! Whaaaaa! Fail...

Needy much? Season 7 of the Wine saga continues with an unnecessary X server in a headless (an headless, if you are into french accents) Ubuntu image. This is not a novel problem, it has been done before in a number of different ways. Some work, some feel MacGyvered, some resemble a cul-de-sac.

**The dead end**: [run a vnc server](https://stackoverflow.com/questions/36221215/using-vncserver-gui-application-virtual-display-in-docker-container) in Ubuntu, connect to it from host. If it seems like an overkill, it is because it is in fact just that. Being able to see what's happening is only important for development, not for automation. when Mac Os Screen Share kept instantly disconnecting, I abandened this avenue. It has never really been that appealing anyway.

**The MacGyver**: [run XQuartz on host, connect remotely](https://medium.com/@mreichelt/how-to-show-x11-windows-within-docker-on-mac-50759f4b65cb). All you need to do is

- install XQuartz
- `xhost + 127.0.0.1` on host to allow remote connections
- `export DISPLAY=host.docker.internal:0` in the container

This works fine for development. It's fine. Really. Todo! Replace later.

On to the next problem: Mono is missing! Install? Ok, Cancel! Gecko is missing! Install? Ok, Cancel! Wine is configured! Ok, cancel! Buttons everywhere, Click-click-click. Python install: next, next, install. More clicks. Problem for tomorrow me: automate the clicks!

Huzzah, finally `wine python --version` responds with `Python 3.7.3` along with a plethora of wine related warning messages. If it was a bicycle, it would be the one from Dennis the Mennace: loud, and on training wheels. But it got you to Mr. Wilson's house.

![Dennis the Menace]({{ site.url }}/img/2019-05-13-wine-pyinstaller/dennis-wheels.gif)

### Automate the clickety-clackety

![click-clack]({{ site.url }}/img/2019-05-13-wine-pyinstaller/clack.gif)

Xdotool is a [handy choice](https://superuser.com/questions/978864/how-to-perform-unattended-installation-for-any-installer-using-wine) for automating inputs to X. No error message can deter us now... "YoU nEEd to EnaBle XTesT". [Fine](https://github.com/XQuartz/xquartz.github.io/blob/03a8fe6cc319783f1b068dd779333b0c5fd4c285/_releases/XQuartz-2.3.2.md):

- `defaults write org.x.X11 enable_test_extensions -boolean true`

Automate all the clicks!

````bash
waitAndEnter() {
    title="$1"
    local window
    while [[ -z "$window" ]]; do
        sleep 10
        echo "waiting for $title..."
        set +e
        window=`xdotool search --name "$title"`
        set -e
    done

    echo "found: $window"

    xdotool windowfocus --sync $window
    xdotool key Return
}
````

Finally: it works! It's alive!

![it's alive]({{ site.url }}/img/2019-05-13-wine-pyinstaller/its-alive.gif)

It's a lie... It only works when the button pressing automagic doohickey is run by hand. It fails when docker build drives it. It appears as though the container is different when created manually via `docker commit`-s from doing `docker build`. That's nonesense. Rummaging through random github issues unrelated to Wine, I came upon a shiny piece of [glimmering hope](https://github.com/moby/moby/issues/12795). Maybe a sneaky bastard of a background process doesn't get to finish before docker moves on to the next build step. That pesky `wineserver` process, passive aggressive mother of all wine processes. Let's add a busy wait until it finishes:

````bash
while (( $(ps | grep wineserver | grep -vc grep) != 0 )); do
    echo "waiting for wineserver to terminate..."
    sleep 5
done
````

### Going headless

![beetlejuice]({{ site.url }}/img/2019-05-13-wine-pyinstaller/beetlejuice.gif)

One last puzzle piece: replace XQuartz with Xvfb, X virtual frame buffer. One last bit of sleuthing: config still fails. Enter a suspicios X-related error message from wine: `fixme:event:wait_for_withdrawn_state timed out`. Lot's of googling later came the realisation that this is a red hering. Nevertheless one that through trial, error, xdotool man page, and sheer luck lead to the solution. After adding `--sync` to `xdotool windowfocus --sync $window`, Python finally agrees to install.

Finally! Bob's your (weird) uncle.
