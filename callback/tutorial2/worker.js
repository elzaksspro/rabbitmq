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

/**
 It's a common mistake to miss the ack. It's an easy error.MQ will eat more and more memory
 as it won't be able to release any unacked messages.
 */
function on_connect(err, conn) {
    if (err) return bail(err);
    process.once('SIGINT', function () {conn.close()});
    
    var q = 'task_queue';
    conn.createChannel(function (err, ch) {
        if (err) {return bail(err, ch);}
        ch.prefetch(2);
        ch.assertQueue(q, {durable: true}, function (err, _ok) {
            if (err) {return bail(err, ch);}
            ch.consume(q, doWork, {noAck: false}, function () {
                console.log('[*] waiting for message. To exit press ctrl+c');
            });
        });
        function doWork(msg) {
            var body = msg.content.toString();
            console.log('[x] received %s', body);
            var secs = body.split('.').length - 1;
            console.log('secs:', secs);
            setTimeout(function () {
                console.log('[x] done');
                ch.ack(msg);
            }, secs * 1000);
        }
    })
}

amqp.connect(on_connect);