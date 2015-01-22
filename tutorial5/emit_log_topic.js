/**
 * Created by tommytang on 1/22/15.
 */
var amqp = require("amqplib");
var when = require("when");

var args = process.argv.slice(2);
var key = (args.length > 0) ? args[0] : 'info';
var message = args.slice(1).join(' ') || 'hello world';

amqp.connect('amqp://localhost').then(function (conn) {
    return when(conn.createChannel().then(function (ch) {
        var ex = 'topic_logs';
        var ok = ch.assertExchange(ex, 'topic', {durable: false});
        return ok.then(function () {
            ch.publish(ex, key, new Buffer(message));
            console.log('send ', key, message);
            return ch.close();
        });
    })).ensure(function () {
        conn.close();
    });
}).then(null, console.log)