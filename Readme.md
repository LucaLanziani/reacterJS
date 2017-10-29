Reacter
-------

A simple Object that can start a chain of actions after a chain of events

The user can define the chain of events/actions as a simple string with the following format:

```
event1 - event2[;<timeout>ms] ... > action1[;<timer>ms] - action2[;<timer>ms] - action3[;<timer>ms]
```

## Simple rules

1. events and actions are simply strings
2. `-` is used as separator on both events and actions
3. it expects `>` as separator between events and actions
4. it expects `;` as timeout/timer separator
5. both the timeout and the timer should have the `ms` suffix
6. given the above rules you cannot use `-` and `>` on your events/actions strings

example: 

```javascript
const Reacter = require('reacter');
let reacter = new Reacter("e1 - e2;30ms > a1 - a2;30ms");
reacter.on('reaction', console.log.bind(console));
reacter.process('e1').process('e2');
```

In this case when Reacter gets an event `e1` followed by and event `e2` fired less than `30ms` from `e1` it will immediatly emit a reaction with `a1` followed by a reaction with `a2` after `~30ms`