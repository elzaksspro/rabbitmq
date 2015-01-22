/**
 * Created by tommytang on 1/22/15.
 */
var amqp = require("amqplib");
var when = require("when");

amqp.connect('amqp://localhost').then(function (conn) {
    return when(conn.createChannel().then(function (ch) {
        var ex = 'logs';
        var ok = ch.assertExchange(ex, 'fanout', {durable: false});

        var message = process.argv.slice(2).join(' ') || 'info: Hello World';

        return ok.then(function () {
            ch.publish(ex, '', new Buffer(message));
            console.log('send ', message);
            return ch.close();
        });
    })).ensure(function () {
        conn.close();
    })
}).then(null, console.warn);