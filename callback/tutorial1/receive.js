/**
 * Created by tommytang on 3/5/15.
 */

/**
 *  receive is for our sender. Our receiver is pushed messages from rabbitmq, so unlike
 *  the sender which publishes a single message,we'll keep it running to listening for messages
 *  and print them out.
 */
var amqp = require("amqplib/callback_api");
function bail(err, conn) {
    console.error(err);
    if (conn) conn.close(function () {
        process.exit(1);
    })
}
var util = require("util");

function on_connect(err, conn) {
    if (err) return bail(err);
    process.once('SIGINT', function () {
        conn.close();
    });
    var q = 'hello';

    function on_channel_open(err, ch) {
        /**
         * Note that we declare the queue here, as well. Because we might start the receiver
         * before the sender, we want to make sure the queue exists before we try to consume
         * message from it.
         */
        ch.assertQueue(q, {durable: false}, function (err, ok) {
            if (err) return bail(err, conn);
            ch.consume(q, function (msg) {
                console.log('[x] received %s', msg.content.toString());
            }, {noAck: true}, function (_consumeOk) {
                console.log('[*] Waiting for message. To exit press ctrl + c');
            });
        })
    }
    conn.createChannel(on_channel_open);
}

amqp.connect(on_connect);