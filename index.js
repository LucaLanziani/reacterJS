const fsm = require('FSM');
const mixin = require('mixin');
const EventEmitter = require('events');

// Build a finite state machine for our pet dragon Burt
class Reacter extends mixin(fsm.Machine, EventEmitter) {

    constructor(events, actions) {
        super();
        this.events = events;
        this.actions = actions;
        this.previousEventTimeStamp;
        this.setup();
    }

    setup() {
        this.events = this.parseEvents(this.events);
        this.actions = this.parseEvents(this.actions);
        this.setupTriggers();
        this.setInitialState('State-1');
        console.log(this.events, this.actions);
    }

    parseEvents(events) {
        let n = 0;
        let transition, group, value, timeout, next;
    
        return events.map(function (event) {
            return event.trim().split(';');
        }).map((event) => {
            return this.parseEvent(event);
        });
    }

    parseEvent(event) {
        let timeout;
        if (event[(event.length-1)].endsWith('ms')) {
            timeout = parseInt(event.pop().slice(0, -2), 10); 
        };
        return {
            event: event.join(';'),
            timeout
        };
    }

    fireActions() {
        if (this.actions.length > 0) {
            this.fireAction(this.actions[0], 0);
        }
    }

    fireAction(action, index) {
        setTimeout(() => {
            this.emit('action', action);
            if (this.actions[(index + 1)]) {
                this.fireAction(this.actions[index+1], index + 1);
            }
        }, action.timeout || 0);
    }

    setupTriggers() {
        this.events.forEach((event, index, events) => {
            console.log('from %s to %s with %s', 'State' + (index-1), 'State' + index, event.event);
            let fireActions;
            if (index === (events.length - 1)) {
                fireActions = this.fireActions;
            }
            this.addTransition(
                event.event, 
                'State' + (index - 1), 
                'State' + index, 
                (receivedEvent, options) => {
                    let timestamp = (options && options.timestamp) || new Date().getTime();
                    if (this.previousEventTimeStamp !== undefined && event.timeout !== undefined) {
                        if ( event.timeout < timestamp - this.previousEventTimeStamp) {
                            console.log("Had to reset, event %s was expected after %s it happend after %s", receivedEvent, event.timeout, (timestamp - this.previousEventTimeStamp))
                            this.previousEventTimeStamp = undefined;
                            this.reset();
                            this.process(receivedEvent);
                            return false;
                        }
                    }
                    console.log("I'm on %s after %s instead of", index, timestamp - this.previousEventTimeStamp, event.timeout);
                    this.previousEventTimeStamp = timestamp;
                }, 
                fireActions
            );
        })
    }
}

var fsms = [];

let transitions = [
    '1/1/1;1 - 1/1/1;1;20ms - 1/1/1;0;30ms - 1/1/1;1 > 2/2/2;1 - 1/1/1;0 - 1/1/1;0;1000ms - 2/2/2/;0;2000ms'
].forEach(function(transition, index) {
    events = transition.split('>')[0].split('-');
    actions = transition.split('>')[1].split('-');
    fsms.push(new Reacter(events, actions).on('action', function (action) {console.log(action)}));
}, this);

var events = [
    {
        event: '1/1/1;1',
        timeout: 15
    },
    {
        event: '1/1/1;1',
        timeout: 1000
    },
    {
        event: '1/1/1;1'
    },
    {
        event: '1/1/1;0'
    },
    {
        event: '1/1/1;1'
    }
]

function emitEvent(events, index) {
    setTimeout(function () {
        fsms[0].process(events[index].event);
        if (events[index+1]) {
            emitEvent(events, index+1);
        }
    }, events[index].timeout || 0);
}

emitEvent(events, 0);

process.stdin.resume();

