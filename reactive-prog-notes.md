# Reactive programming
[source](https://class.coursera.org/reactive-002/lecture)

# Week 1
## What is Reactive Programming
event driven:
- reacts to loads - scalable
- react to failures - resilient
- react to users - responsive

### Event driven
- loosely coupled event handlers
- asynchronous

### Scalable
able to be expanded according to usage
scale up: make use of parallelism
  - important: minimize shared mutable state

scale out: make use of multiple server nodes
  - important: location transparency
  - resilience

### Resilience
- Needs to be part of system design
- looseley coupled components
- strong encapsulation of state

failures can be:
  - software failure
  - hardware failure
  - connection failure

### Responsive
provides rich, real time interaction with users even under load and presence of failures

### Event handling
Traditionally done with callbacks

    class Counter exetnds ActionListener {
      private var count = 0
      button.addActionListener(this)

      def actionPerformed(e: ActionEvent): Unit = {
        count += 1
      }
    }

callback registers itself with button

problems with this model:
  - side effect of callback - leads to shared mutable state
  - cannot be composed
  - leads to "callback-hell" - web of callbacks

solution: composable event abstractions
  - events should be first class
  - events represented as mesages
  - event ahndlers are also first class
  - complex handlers can be composed from primitives

## Functions and Pattern Matching

## Collections

## Functional Random Generators

## Monads

# Week 2

## Functions and State

## Identity Change

## Loops

## Discrete Event Simulation

## Discrete Event Simulation API

## Discrete Event Simulation Implementation and Test

## Imperative Event Handling: Observer Pattern

## Functional Reactive Programming (FRP)

## A Simple FRP Implementation
