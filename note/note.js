/**
 1. 基本的hello world
    |-- 代码结构
        |-- 创建connect, 获得conn对象 [amqp.connect('amqp://localhost',on_connect);]
        |-- 创建channel, 获得ch对象 [conn.createChannel(function (err, ch) {}]
        |-- 声明queue,并对queue进行配置, [ch.assertQueue(q, {durable: false}, function (err, ok) {}]
        |-- 生产者发送消息，关闭连接， 消费者接受消息
            |-- 生产者
                |-- 发送消息
                    第二个参数必需是字符串
                    ch.sendToQueue(q, new Buffer(JSON.stringify(arr)));
                |-- 关闭连接
                    ch.close(function () {
                        conn.close();
                    });
            |-- 消费者
                ch.consume(q, doWork, {noAck: false}, cb)
    |-- 注意点
        |-- ch.consume方法会一直监听，不会断开
        |-- 消费者也需要声明queue,确保即使消费者在生产者之后启动，queue也存在
 */

/**
 2. 数据完整性
    |-- 生产者
        |-- {durable: true}确保queue不会丢失，即使RMQ重启
        ch.assertQueue(q, {durable: true}, function (err, _ok) {})
        |-- {persistent: true}确保queue持久化
        ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    |-- 消费者
        ch.assertQueue(q, {durable: true}, function (err, _ok) {})
    |-- Ack
        消费者开启ack: {noAck: false}
        ch.consume(q, doWork, {noAck: false}, function () {
            console.log('[*] waiting for message. To exit press ctrl+c');
        });

    |-- prefetch
        ch.prefetch(1);
        RabbitMQ allow consumers to specify the size of the limit of unacknowledged messages on a queue basis.
        This value is used to specify how many messages is send to the consumer and cached by RabbitMQ client library
        Once the buffer is full the RMQ will wait with delivering new message to that consumer until it sends acks

 */
