/**
 * Created by user on 2014/12/8.
 */

var q = 'hello';

var open = require('amqplib').connect('amqp://localhost');

// Publisher
open.then(function(conn) {
    var ok = conn.createChannel();
    ok = ok.then(function(ch) {
        ch.assertQueue(q, {durable: false});
        ch.sendToQueue(q, new Buffer('something to do'));
    });
    return ok;
}).then(null, console.warn);