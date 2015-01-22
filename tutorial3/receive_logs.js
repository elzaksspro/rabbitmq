/**
 * Created by tommytang on 1/22/15.
 */

var amqp = require("amqplib");
amqp.connect('amqp://localhost').then(function (conn) {
    process.once('SIGINT', function () {
        conn.close();
    });
    return conn.createChannel().then(function (ch) {
       var ok = ch.assertExchange('logs', 'fanout', {durable: false});
        ok = ok.then(function () {
            return ch.assertQueue('', {exclusive: true});
        });
        ok = ok.then(function (qok) {
            console.log("qok\n", qok);
            return ch.bindQueue(qok.queue, 'logs', '').then(function () {
                return qok.queue;
            });
        });
        ok = ok.then(function (queue) {
            return ch.consume(queue, logMessage, {noAck: true});
        });
        return ok.then(function () {
            console.log('waiting for logs to exit press ctrl c');
        });
        function logMessage(msg) {
            console.log('[x] ', msg.content.toString());
        }
    });
}).then(null, console.warn)