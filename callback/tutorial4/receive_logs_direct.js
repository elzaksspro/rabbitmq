/**
 * Created by tommytang on 3/5/15.
 */
var amqp = require("amqplib/callback_api");

var basename = require("path").basename;

var severities = process.argv.slice(2);
if (severities.length < 1) {
    console.log('Usage %s [info] [warning] [error]', basename(process.argv[1]));
    process.exit(1);
}
function bail(err, conn) {
    console.log(err);
    if (conn) {
        conn.close(function () {
            process.exit(1);
        });
    }
}

function on_connect(err, conn) {
    if (err) return bail(err);
    process.once('SIGINT', function(){conn.close();});
    conn.createChannel(function (err, ch) {
        if (err) return bail(err);
        var ex = 'direct_logs';
        var exopts = {durable: false};

        ch.assertExchange(ex, 'direct', exopts);
        ch.assertQueue('', {exclusive: true}, function (err, ok) {
            if (err) return bail(err);
            var queue = ok.queue;
            console.log("queue\n", queue);

            severities.forEach(function (severity) {
                console.log(severity);
                ch.bindQueue(queue, ex, severity);
            });
            console.log("**********************");
            ch.consume(queue, logMessage, {noAck:true}, function (err) {
                if (err) return bail(err);
                console.log('[*] waiting for logs');
//                sub(null);
            });

        });
    });
}
function logMessage(msg) {
    console.log('[x] %s:%s', msg.fields.routingKey, msg.content.toString());
};

amqp.connect(on_connect);