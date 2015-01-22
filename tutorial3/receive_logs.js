/**
 * Created by tommytang on 1/22/15.
 */

var amqp = require("amqplib");
amqp.connect('amqp://localhost').then(function (conn) {
    process.once('SIGINT', function () {
        conn.close();
    });
    return conn.createChannel().then(function (ch) {
       var ok = ch.assertExchange('logs', 'fanout', {durable: false});
        ok = ok.then(function () {
            // 当我们连接上RabbitMQ的时候，我们需要一个全新的，空的队列。我们可以手动创建一个随机的队列名
            // 或者让服务器为我们选择一个随机的队列名，声明的时候传入''就可以了。 exclusive:true表示当
            // 消费者断开连接时候，这个队列应当被删除
            return ch.assertQueue('', {exclusive: true});
        });
        ok = ok.then(function (qok) {
            console.log("qok\n", qok);
            return ch.bindQueue(qok.queue, 'logs', '').then(function () {
                return qok.queue;
            });
        });
        ok = ok.then(function (queue) {
            return ch.consume(queue, logMessage, {noAck: true});
        });
        return ok.then(function () {
            console.log('waiting for logs to exit press ctrl c');
        });
        function logMessage(msg) {
            console.log('[x] ', msg.content.toString());
        }
    });
}).then(null, console.warn)