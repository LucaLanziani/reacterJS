var Reacter = require('../');
var tap = require('tap');


tap.test('One action, one reaction', function (childTest) {
    new Reacter('1 > 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event, 'Reaction!!!');
        childTest.end();
    }).process('1');
});

tap.test('Two actions, one reaction', function (childTest) {
    new Reacter('1 - 2 > 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event, 'Reaction!!!');
        childTest.end();
    })
    .process('1')
    .process('2');
});

tap.test('One action, Two reactions', function (childTest) {
    childTest.plan(2);
    new Reacter('1 > 1/1/1;0 - 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event, 'Reaction!!!');
    })
    .process('1');
});

tap.test('One action, Two reactions', function (childTest) {
    childTest.plan(2);
    new Reacter('1 - 2 > 1/1/1;0 - 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event, 'Reaction!!!');
    })
    .process('1')
    .process('2');
});

tap.test('Timeout, Reacter should not fire any reaction', function (childTest) {
    childTest.plan(0);
    let reacter = new Reacter('1 - 2;100ms > 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event, 'Reaction!!!');
    }).process('1');

    setTimeout(function() {
        reacter.process('2'); 
    }, 200);
});

tap.test('Timeout should reset the machine to initial state', function (childTest) {
    childTest.plan(1);
    let reacter = new Reacter('1 - 2;100ms > 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event);
    }).process('1');

    setTimeout(function() {
        reacter.process('2');
        childTest.equal('State0', reacter.getCurrentState(), 'Back to State0');
    }, 200);
});

tap.test('Timeout should reset the machine and re-fire the event', function (childTest) {
    childTest.plan(1);
    let reacter = new Reacter('1 - 1;100ms > 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event);
    }).process('1');

    setTimeout(function() {
        reacter.process('1');
        childTest.equal('State1', reacter.getCurrentState(), 'Back to Stat1');
    }, 200);
});


tap.test('Multiple resets are fine', function (childTest) {
    childTest.plan(4);
    let reacter = new Reacter('1 - 1;100ms > 1/1/1;0').on('reaction', function (event) {
        childTest.equal('1/1/1;0', event, 'Reaction!!!');
    }).process('1');

    setTimeout(function() {
        reacter.process('1');
        childTest.equal('State1', reacter.getCurrentState(), 'Reset 1');
    }, 200);

    setTimeout(function() {
        reacter.process('1');
        childTest.equal('State1', reacter.getCurrentState(), 'Reset 2');
    }, 400);

    setTimeout(function() {
        reacter.process('1');
        childTest.equal('State1', reacter.getCurrentState(), 'Reset 3');
    }, 600);

    setTimeout(function() {
        reacter.process('1');
    }, 610);
});


