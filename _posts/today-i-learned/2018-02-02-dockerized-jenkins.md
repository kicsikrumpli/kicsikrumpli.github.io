---
layout: post
title:  "TIL: Dockerized Jenkins"
date:   2018-01-30 15:37:54 +0200
categories: til docker jenkins
---

## Pets vs. Cows
After installing Jenkins and launching it for the first time, we are greeted by a setup wizard. This tells tales about how Jenkins is supposed to be viewed as a pet. Install it; fiddle with the setup; make some changes; add build scripts via the gui; or configure a build to use the Jenkinsfile bundled with the app; make some more changes; do the occasional backup of JENKINS_HOME, maybe automate it even; we may even want to enable Jenkins to use multiple versions of Maven, or Java, let's configure those too; and slowly, like the proverbial dog, it starts to resemble its owner. 

This is not quite what we want. We want cows, not pets. We want something immutable, which can be spun up from a version controlled configuration automatically, instead of following setup instructions in a chicken soup recipe (enough with the farm references already 

![that'll do pig]({{ site.url }}/img/2018-02-02-dockerized-jenkins/babe.gif)

, I hear you). 

## Docker to the rescue! 
There is in fact an official Docker image for Jenkins. On launch it greets with the same one-time config wizard, as with a locally installed version. Looking at the Dockerfile, it declares `JENKINS_HOME` as a volume to persist configuration We are still grooming a pet, except that instead of it running around freely in your apartment, it now lives in a fancy pet crate. 

![dog in a crate]({{ site.url }}/img/2018-02-02-dockerized-jenkins/crate.gif)

But it's a good start, let's create our own Docker image. Instead of configuring multiple versions of build tools within Jenkins, lets embrace the notion of (single) purpose built immutable tools wrapped in containers. Need a different version of maven? Spin up a new instance with a different configuration. What we want is a specialized build tool, that happens to use Jenkins internally, not a single Swiss Army Knife. This also simplifies our task at hand, we can use the single default Maven and single default Jdk installation of the Docker image. Jdk and git are already installed, we only have to sprinkle a pinch of Maven on it:

    FROM jenkins/jenkins:lts
    RUN apt-get update && apt-get install -y maven

We can make our immutable Jenkins aware of the tools at its disposal with groovy scripts. Put them in `/usr/share/jenkins/ref/init.groovy.d/` to automatically execute them on startup.

    def descriptor = new JDK.DescriptorImpl();
    descriptor.setInstallations(new JDK(name, home));
    descriptor.save();

    def extension = Jenkins.instance.getExtensionList(Maven.DescriptorImpl.class)[0]
    extension.setInstallations(new Maven.MavenInstallation(name, home, []))
    extension.save()

Preconfigure passwords in a similar manner, so that they wouldn't have to be baked 

![julia child baking]({{ site.url }}/img/2018-02-02-dockerized-jenkins/baking.gif)

into build scripts: 

    def store = Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()
    def user = new UsernamePasswordCredentialsImpl(CredentialsScope.GLOBAL, 
        'foo', '', username, passwd)
    store.addCredentials(Domain.global(), user)

Jenkins plugins are installed by an out of the box script, an _objet trouvé_ if you will. 

![duchamp]({{ site.url }}/img/2018-02-02-dockerized-jenkins/duchamp.gif)

Pass a list of plugins to `install-plugins.sh` to download and install. Plugin list tracked in git takes care of the version controlled aspect. 

Copy all of this into the container, we now have a working, preconfigured, immutable Jencow.

## Gotchas
As the difference between theory in practice goes, there have been some unexpected gotchas. For one, although Docker gives us platform independent deployment, that does not mean that it should guard against the idiosyncrasies of cross platform development. Here's a little thought experiment. Put a path into a file, say `/etc/foo`. Put this file, let's call it `foo.txt`, into git, and check it out on a Windows machine. Proceed by copying it into a Linux based Docker image. To spoil the punchline, your path is no longer _root-eeteecee-slash-foo_; it's _root-slash-eeteecee-slash-foo-invisible-character. Tl;dr [CR-LF](https://github.com/jenkinsci/docker/issues/516). 

![don't line-feed after midnight]({{ site.url }}/img/2018-02-02-dockerized-jenkins/gremlins.gif)

Another fun discovery is the working-as-designed behavior of Docker in case a `VOLUME` is declared in a base image. [Working as designed...](https://github.com/moby/moby/issues/3639)

![wink-wink]({{ site.url }}/img/2018-02-02-dockerized-jenkins/winkwink.gif)

Ownership of the volume remains with the base image. If a child image's Dockerfile copies some files into a directory mapped to the parent's volume, it is only visible in that single layer, but invisible in the final image. This can be argued, but the fact that `VOLUME` statements are valid in Dockerfiles breaks the stateless nature of containers by mixing in details of persistence. This is better left declared with the `run` command. The only apparent way around this is to bind mount the directory to a host directory. This way the child image is able to copy into the base image's volume bound directory. Why would I want to do that? Maybe to preload Jenkins with build jobs; this way the build scripts also lend themselves to be easiliy version controlled.

## Build Scripts
To generate build scripts I wanted to follow an approach similar to how Jenkins plugins are installed: declare them in a version controlled text file. The only parameter of the build scripts is the repo's git clone url; other details are easily parsed from pom.

For the build script type I have chosen the declarative model of the pipeline plugin. It breaks down the build steps into readble stages without much voodoo. Each stage has its steps, and each step is described in a declarative way. The only piece of duct tape is applied to the reading of the pom file: there is no easy way to convince the pipeline to parse the pom only after checking out the project from git. ` ¯\\\_(ツ)\_/¯ `. With some ommisions for the sake of brevity, this is the essence of the build script:

    pipeline {
        agent any
        stages {
            stage('Checkout') {
                steps {
                    git credentialsId: 'foo', url: '[[REPO_NAME]]'
                }   
            }
            stage('Config') {
                steps {
                    script {
                        def pom = readMavenPom file: 'pom.xml'
                        ARTIFACT_ID = pom.artifactId
                    }
                }
            }
            ...
            stage('Deploy') {
                steps {
                    sh 'mvn site:stage -DstagingDirectory=${env.DOCS_ROOT}/${ARTIFACT_ID}'
                }
            }
        }
    }

For our purposes site docs is not deployed to the target specified in `distributionManagement`. Instead it is staged in a local directory, shared with an nginx container via volumes.

This template is only a bit of bash magic away from an actual build script:

    sed -iE "s|[[REPO_NAME]]|$url|g" "$template"

For every repo url replace template variable REPO_NAME in the template, and copy it under `$JENKINS_HOME/jobs/$JOB_NAME`.

## Putting the Pieces Together
The last piece of the puzzle is orchestrating the bits and pieces. Docker-compose ties them neatly together with shared volumes and appropriately chosen environemnt variables.

## Links
- [Dockerizing Jenkins](https://dszone.com/articles/dockerizing-jenkins-2-setup-and-using-it-along-wit)
- [Base Image Volume Issue](https://github.com/moby/moby/issues/3639)
- [Jenkins Plugin List with Windows Line Ending Issue](https://github.com/jenkinsci/docker/issues/516)
- [Jenkins Declarative Pipeline](https://jenkins.io/blog/2016/12/19/declarative-pipeline-beta/)
- [Imperative vs Declarative Pipelines](https://stackoverflow.com/questions/44657896/jenkins-pipeline-jenkinsfile-node-and-pipeline-directives)
