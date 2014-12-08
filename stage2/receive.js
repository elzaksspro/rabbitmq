/**
 * Created by user on 2014/12/8.
 */
var amqp = require('amqplib');
var when = require('when');

amqp.connect('amqp://localhost').then(function (conn) {
    process.once('SIGINT', function () {
        conn.close();
    });
    return conn.createChannel().then(function (ch) {
        var ok = ch.assertQueue('hello', {durable: false});

        ok = ok.then(function (_qok) {
            return ch.consume('hello', function (msg) {
                console.log('received ', msg.content.toString());
            }, {noAct: true});
        });

        return ok.then(function (_consumeOk) {
            console.log(' waiting for message. to exit press ctrl +c');
        });
    });
}).then(null, console.warn);