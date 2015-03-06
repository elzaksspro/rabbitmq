/**
 * Created by tommytang on 3/5/15.
 */
var amqp = require("amqplib/callback_api");
function bail(err, conn) {
    console.log(err);
    if (conn) {
        conn.close(function () {
            process.exit(1);
        });
    }
}

function on_connect(err, conn) {
    if (err) { return bail(err)}
    var ex = 'logs';

    function on_channel_open(err, ch) {
        if (err) return bail(err, conn);

        /**
         *  The fanout exchange is very simple. It just broadcasts all the messages it receives to all the queues it knows.
         */
        // 声明一个exchange
        ch.assertExchange(ex, 'fanout', {durable: false});
        var msg = process.argv.slice(2).join(' ') || 'info: hello world';
        // the message will be lost if no queue is bound to the exchange yet, but that's okay for us; if no consumer is listening
        // yet we can safely discard the message.
        // the first parameter is the name of the the exchange. The empty string denotes the default or nameless exchange;
        // message are routed to the queue with the name specified by routingKey, if it exists.
        ch.publish(ex, '', new Buffer(msg));
        console.log('[x] sent %s', msg);
        ch.close(function () {
            conn.close();
        });
    }
    conn.createChannel(on_channel_open);
}
amqp.connect(on_connect);