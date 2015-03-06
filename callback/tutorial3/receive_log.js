/**
 * Created by tommytang on 3/5/15.
 */
var amqp = require("amqplib/callback_api");
function bail(err, conn) {
    console.error(err);
    if (conn) conn.close(function() { process.exit(1); });
}
function on_connect(err, conn) {
    if (err) {return bail(err)}
    process.once('SIGINT', function () {
        conn.close();
    });

    var ex = 'logs';

    function on_channel_open(err, ch) {
        if (err) {
            return bail(err, conn);
        }
        // 当我们连接上RabbitMQ的时候，我们需要一个全新的，空的队列。我们可以手动创建一个随机的队列名
        // 或者让服务器为我们选择一个随机的队列名，声明的时候传入''就可以了。 exclusive:true表示当
        // 消费者断开连接时候，这个队列应当被删除
        ch.assertQueue('', {exclusive: true}, function (err, ok) {
            var q = ok.queue;
            console.log(q);
            // we've already created a fanout exchange and a queue.Now we need to tell the exchange to send messages to our
            // queue. That relationship between exchange and a queue is called a binding.
            ch.bindQueue(q, ex, '');
            ch.consume(q, logMessage, {noAck: true}, function (err, ok) {
                if (err) {return bail(err, conn);}
                console.log('waiting for logs');
            });
        });
    }
    function logMessage(msg) {
        if (msg)
            console.log(" [x] '%s'", msg.content.toString());
    }
    conn.createChannel(on_channel_open);
}

amqp.connect(on_connect);