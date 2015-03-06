/**
 * Created by tommytang on 3/6/15.
 */
var amqp = require('amqplib/callback_api');
var basename = require('path').basename;

var keys = process.argv.slice(2);
if (keys.length < 1) {
    console.log('Usage %s pattern [pattern...]',
      basename(process.argv[1]));
    process.exit(1);
}

function bail(err, conn) {
    console.error(err);
    if (conn) conn.close(function() { process.exit(1); });
}

function logMessage(msg) {
    console.log(" [x] %s:'%s'",
      msg.fields.routingKey,
      msg.content.toString());
}
function on_connect(err, conn) {
    if (err !== null) return bail(err);
    process.once('SIGINT', function () {
        conn.close();
    });
    conn.createChannel(function (err, ch) {
        if (err !== null) return bail(err);
        var ex = 'topic_logs';
        var exopts = {durable: false};
        ch.assertExchange(ex, 'topic', exopts);
        ch.assertQueue('', {exclusive: true}, function (err, ok) {
            var queue = ok.queue;
            if (err !== null) return bail(err);
            keys.forEach(function (key) {
                ch.bindQueue(queue, ex, key)
            });
            ch.consume(queue, logMessage, {noAck: true}, function (err) {
                console.log('waiting for logs');
            });
        });

    });
}
amqp.connect(on_connect);