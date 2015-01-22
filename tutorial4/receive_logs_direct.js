/**
 * Created by tommytang on 1/22/15.
 */
var amqp = require("amqplib");
var all = require("when").all;
var basename = require("path").basename;

var severities = process.argv.slice(2);
console.log("severities\n", severities);
if (severities.length < 1) {
    console.warn('Usage: %s [info] [warning] [error]', basename(process.argv[1]));
    process.exit(1);
}

amqp.connect('amqp://localhost').then(function (conn) {
    process.once('SIGINT', function () {
        conn.close();
    });
    
    return conn.createChannel().then(function (ch) {
        var ex = 'direct_logs';
        
        var ok = ch.assertExchange(ex, 'direct', {durable: false});
        ok = ok.then(function () {
            return ch.assertQueue('', {exclusive: true});
        });
        ok = ok.then(function (qok) {
            var queue = qok.queue;
            return all(severities.map(function (sev) {
                ch.bindQueue(queue, ex, sev);
            })).then(function () {
                return queue;
            })
        });
        
        ok = ok.then(function (queue) {
            return ch.consume(queue, logMessage, {noAck: true});
        });
        
        return ok.then(function () {
            console.log('waiting for logs. To exit press ctrl c');
        });
        
        function logMessage(msg) {
            console.log('[x] %s: "%s"', msg.fields.routingKey, msg.content.toString());
        }
        
    });
}).then(null, console.warn);