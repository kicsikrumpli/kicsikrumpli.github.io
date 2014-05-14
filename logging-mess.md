#Logging Mess
different frameworks, different conventions
---
+ JUL (Java.Util.Logging)
+ LOG4J
+ Logback
+ SLF4J

Basic Questions
---
+ How to get a logger instance
+ What logging levels are provided
+ How to configure

JUL
===
JUL instance
---

    Logger.getLogger(String)

JUL Logging levels
---
+ info
+ warning
+ fine
+ finer
+ finest

no debug or trace

JUL Configuration
---
Default configuration file:

    JAVA_HOME/lib/logging.properties

Custom configuration in config file passed as system property

    java -Djava.util.logging.config.file=mylogging.properties

JUL Configuration items
---
handlers: responsible for outputting log messages
    
    handlers= java.util.logging.ConsoleHandler,
    java.util.logging.FileHandler

root log level

    .level= INFO 

log level for specific logger

    com.xyz.foo.level= SEVERE

filter log level @ handlers

    java.util.logging.ConsoleHandler.level= INFO

Console output is barely formattable, consists of two lines

LOG4J
===
LOG4J Instance
---
    Logger.getLogger(App.class)

LOG4J Logging Levels
---
+ trace
+ debug
+ info
+ warn
+ error
+ fatal

LOG4J Configuration
---
1. system property: 

    log4j.configuration=myConfigFile

2. file on classpath
   
    log4j.properties

LOG4J Configuration Items
---
Logger names and their assigned appenders

    log4j.<root logger>=<Logging level>, <Appender name>
    log4j.logger.com.eggs= INFO, stdout

logger names ordered in a "." separated chierarchical "namespace"

Appender configuration

    log4j.appender.stdout=org.apache.log4j.ConsoleAppender
    log4j.appender.stdout.Target=System.out
    log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
    log4j.appender.stdout.layout.ConversionPattern=
        %d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n

Logback
===
Logback Dependencies
---
    logback-core-....jar
    logback-classic....jar

Logback Instance
---
    LoggerFactory.getLogger(String)

String is the logger's name.
Logger names are ordered in "."-separated hierarchy.
Logging levels are inherited, unless explicitly specified.
Appenders are added to inherited ones, unless specified otherwise with "additivity flag".

Logback Logging Levels
---
+ trace
+ debug
+ info
+ warn
+ error

Logger Hierarchy
---

    root
    |
    x
    |
    x.y
    |
    x.y.z

Logger Level Inheritance
---

logger | Explicit Setting | Effective Setting
--- | --- | ---
root | Debug | Debug
x | -  | Debug
x.y | Info  | Info
x.y.z | -   | Info

Appender Inheritance
---

logger | Explicit Setting | Appenders
--- | --- | ---
root | A | A
x | -  | A
x.y | A1 | A,A1
x.y.z | A2 | A,A1,A2


Logback Configuration
---
1. logback.groovy on classpath
2. logback-test.xml on classpath
3. logback.xml on classpath
4. automatic configuration

by *convention* config file is
   
   conf/logback.xml

Logback Configuration Items
---

    <configuration>
      <appender name="STDOUT" 
      class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
          <pattern> ... </pattern>
        </encoder>
      </appender>

      <root level="debug">
        <appender-ref ref="STDOUT" />
      </root>

      <logger name="foo.bar" level="info" />

    </configuration>

+ appender: responsible for outputting logger message
+ pattern: configures logger message format
+ appender-ref: assigns appender to logger

Logback Appender Pattern
---

+ %c{length} name of logger
+ %d{pattern} date
+ %caller{depth} ~stack trace
+ %L line number of logging event
+ %M method name

more at http://logback.qos.ch/manual/layouts.html

SLF4J
===
Simple Logging Facade For Java

+ default implementation: NOP logger
+ native implementations: Logback, Simple Logger
+ common API for various implementation 
+ bridge **over** various loggers
+ adapter for various loggers

NOP Logger
---
Only slf4j.api.jar is on classpath without implementation

Silently discards all logging

Native Implementations
---
Logback: slf4j.api.jar and logback.jar on classpath
Simple logger: slf4j.api.jar and slf4j-simple.jar on classpath

both natively implement slf4j api, there is no need for additional bridge classes.

Common API
---
SLF4J gives a common api for logger calls. There is no need to modify code to reconfigure or to change logger implementation of a specific project. It is enough to include different .jar's on the classpath.

Bridge
---
Translates SLF4J api-calls to the calls of a specific implementation. Logger is configured through the implementation's native configuration. Bridge classes are

+ xxx_over_slf4j.jar
+ JUL_to_slf4j.jar

(JUL is part of jdk, has to be programmatically hijacked, hence the different name)

Include on classpath:

+ SLF4J_api
+ xxx_over_SLF4J bridge
+ xxx implementation

Adapter
---
Adapter classes convert all calls to a specific implementation.

Unified logger configuration

Include on classpath:

+ SLF4J_api
+ SLF4J_xxx adapter
+ xxx implementation

So if xxx is log4j, every call is routed through log4j implementation
