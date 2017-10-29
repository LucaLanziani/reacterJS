"use strict";

const fsm = require('FSM');
const mixin = require('mixin');
const EventEmitter = require('events');

// Build a finite state machine for our pet dragon Burt
class Reacter extends mixin(fsm.Machine, EventEmitter) {

    constructor(chainOfEvents, options) {
        super();
        this.options = options || {};
        this.events = chainOfEvents.split('>')[0];
        this.reactions = chainOfEvents.split('>')[1];
        this.previousEventTimeStamp;
        this.setup();
    }

    setup() {
        this.events = this.parseEvents(this.events);
        this.reactions = this.parseEvents(this.reactions);
        this.setupTriggers();
        this.setInitialState("State0");
        return this;
    }

    parseEvents(events) {    
        return events.split('-').map(function (event) {
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

    react(index) {
        let reaction = this.reactions[index];

        if (reaction === undefined) {
            if (this.options.resetAfterReactions) {
                this.reset();
            }
            return
        };

        if (this.options.resetBeforeReactions && index === 0) {
            this.reset();
        }

        setTimeout(() => {
            this.emit('reaction', reaction.event);
            this.react(index + 1);
        }, reaction.timeout || 0);
    }

    setupTriggers() {
        this.events.forEach((event, index, events) => {
            let firereactions;
            if (index === (events.length - 1)) {
                firereactions = this.react.bind(this, 0);
            }
            this.addTransition(
                event.event, 
                'State' + index, 
                'State' + (index + 1), 
                (receivedEvent, options) => {
                    let timestamp = (options && options.timestamp) || new Date().getTime();
                    if (this.previousEventTimeStamp !== undefined && event.timeout !== undefined) {
                        if ( event.timeout < timestamp - this.previousEventTimeStamp) {
                            this.previousEventTimeStamp = undefined;
                            this.reset();
                            this.process(receivedEvent);
                            return false;
                        }
                    }
                    this.previousEventTimeStamp = timestamp;
                }, 
                firereactions
            );
        })
    }
}

module.exports = Reacter;