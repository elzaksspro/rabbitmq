/**
 * Created by tommytang on 1/22/15.
 */
var amqp = require("amqplib");

amqp.connect('amqp://localhost').then(function (conn) {
    process.once('SIGINT', function () {
        conn.close();
    });

    return conn.createChannel().then(function (ch) {
        var ok = ch.assertQueue('task_queue', {durable: true});
        ok = ok.then(function () {
            ch.prefetch(1);
        });
        ok = ok.then(function () {
            ch.consume('task_queue', doWork, {noAck: false});
            console.log('waiting for message, to exit press ctrl c');
        });
        return ok;
        function doWork(msg) {
            var body = msg.content.toString();
            console.log('received:', body);
            var secs = body.split('.').length - 1;
            console.log('task takes ', secs);
            setTimeout(function () {
                console.log(' x done');
                ch.ack(msg);
            }, secs * 1000);
        }
    });
}).then(null, console.warn);