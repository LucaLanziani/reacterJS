Reacter
-------

A simple Object that can start a chain of reactions after a chain of events

The user can define the chain of actions/reactions as a simple string with the following format:

```
event1 - event2[;timeout] ... > action1[;timer] - action2[;timer] - action3[;timer]
```

**ATTENTION**: both the timeout and the timer should have the `ms` suffix

example: 

```
const Reacter = require('reacter');
let reacter = new Reacter("e1 - e2;30ms > a1 - a2;30ms");
reacter.on('reaction', console.log.bind(console));
reacter.process('e1').process('e2');
```

In this case when Reacter gets an event `e1` followed by and event `e2` fired less than `30ms` from `e1` it will immediatly emit a reaction with `a1` followed by a reaction with `a2` after `~30ms`