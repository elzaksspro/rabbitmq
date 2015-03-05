/**
 * Created by tommytang on 3/5/15.
 */
var amqp = require("amqplib/callback_api");
function bail(err, conn) {
    console.error(err);
    if (conn){
        conn.close(function () {
            process.exit(1);
        });
    }
}
var obj = {
    name: 'tsq',
    age: 22
};
var arr = [obj, obj];
function on_connect(err, conn) {
    if (err) return bail(err);
    var q = 'hello';
    var msg = 'Hello World';

    //2. 创建channel
    // It is where most of the api for gettting things done resides
    conn.createChannel(function (err, ch) {
        if (err) return bail(err, conn);
        // 3. 声明一个queue
        // To send, we must declare a queue for us to send to; then we can publish a message to the queue
        ch.assertQueue(q, {durable: false}, function (err, ok) {
            if (err) return bail(err, conn);

            // 4. 发送消息
            ch.sendToQueue(q, new Buffer(JSON.stringify(arr)));
            console.log('[x] sent %s', msg);

            // Lastly, we close the channel and the connection
            ch.close(function () {
                conn.close();
            });
        });
    });
}

// 1. 创建连接
amqp.connect('amqp://localhost',on_connect);
//amqp.connect('amqp://114.215.159.50',on_connect);

/**
 {amqp_error,access_refused,
"PLAIN login refused: user 'guest' can only connect via localhost",
'connection.start_ok'}}
 */