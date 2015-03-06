/**
 * Created by tommytang on 3/6/15.
 */
var amqp = require("amqplib/callback_api");

var args = process.argv.slice(2);
var key = (args.length > 0 ) ? args[0] : 'info';
var message = args.slice(1).join(' ') || 'Hello World';

function bail(err, conn) {
    console.error(err);
    if (conn) conn.close(function() { process.exit(1); });
}
amqp.connect(on_connect);

function on_connect(err, conn) {
    if (err !== null) return bail(err);
    var ex = 'topic_logs';
    var exopts = {durable: false};
    conn.createChannel(function (err, ch) {
       ch.assertExchange(ex, 'topic', exopts, function (err, ok) {
           if (err !== null) return bail(err);
           ch.publish(ex, key, new Buffer(message));
           console.log('[x] sent %s %s:', key, message);
           ch.close(function () {
               conn.close();
           });
       });
    });
}