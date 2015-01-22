/**
 * Created by tommytang on 1/22/15.
 */
var amqp = require("amqplib");
var basename = require("path").basename;
var all = require("when").all;

var keys = process.argv.slice(2);
if (keys.length < 1) {
    console.log("usage: %s pattern [pattern...]", basename(process.argv[1]));
    process.exit(1);
}

amqp.connect('amqp://localhost').then(function (conn) {
    process.once('SIGIN', function () {
        conn.close();
    });
    return conn.createChannel().then(function (ch) {
        var ex = 'topic_logs';
        var ok = ch.assertExchange(ex, 'topic', {durable: false});
        
        ok = ok.then(function () {
            return ch.assertQueue('', {exclusive: true});
        });
        
        ok = ok.then(function (qok) {
            var queue = qok.queue;
            return all(keys.map(function (rk) {
                ch.bindQueue(queue, ex, rk);
            })).then(function () {
                return queue;
            });
        });
        
        ok = ok.then(function (queue) {
            return ch.consume(queue, logMessage, {noAck: true});
        });
        
        return ok.then(function () {
            console.log('waiting for logs. to exit press ctrl c');
        });
        
        function logMessage(msg) {
            console.log('[x] %s : "%s"', msg.fields.routingKey, msg.content.toString());
        }
    });
}).then(null, console.warn);