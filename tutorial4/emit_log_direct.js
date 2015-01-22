/**
 * Created by tommytang on 1/22/15.
 */
var amqp = require("amqplib");
var when = require("when");

var args = process.argv.slice(2);
console.log("args\n", args);
var severity = (args.length > 0) ? args[0] : 'info';
console.log("severity\n", severity);
var message = args.slice(1).join(' ') || 'hello world';
console.log("message\n", message);

amqp.connect('amqp://localhost').then(function (conn) {

    return when(conn.createChannel().then(function (ch) {
        var ex = 'direct_logs';
        var ok = ch.assertExchange(ex, 'direct', {durable: false});
        return ok.then(function () {
            ch.publish(ex, severity, new Buffer(message));
            console.log('send ', severity, message);
            return ch.close();
        });
    })).ensure(function () {
        conn.close();
    });
}).then(null, console.warn);