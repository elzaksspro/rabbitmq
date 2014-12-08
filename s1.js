/**
 * Created by user on 2014/12/8.
 */
var q = 'tasks';
var open = require('amqplib').connect('amqp://localhost');

// publisher
console.log(1);
open.then(function (conn) {
    console.log(2);
    var ok = conn.createChannel();
    ok = ok.then(function (ch) {
        console.log(3);
        ch.assertQueue(q);
        ch.sendToQueue(q, new Buffer('mama to do'));
    });
    console.log(4);
    return ok;
}).then(null, console.warn);
console.log(6);