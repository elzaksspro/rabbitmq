/**
 * Created by tommytang on 3/5/15.
 */

/**
 Work Queues
 The main idea behind work queues is to avoid doing a resource-intensive task immediately
 and having to wait for it to complete.Instead we schedule the task to be done later.

 We encapsulate a task as a message and send it to a queue. A worker process running in the
 background will pop the tasks and eventually execute the job.When you run many workers the
 tasks will be shared between them.

 This concept is especially useful in web applications where it's impossible to handle a
 complete task during a short http request window

 In order to make sure message is never lost, RabbitMQ supports message acknowledgments. An
 ack is sent back from the consumer to tell mq that a particular message has been received,
 processed and that RabbitMQ is free to delete it.

 If a consumer dies without sending an ack, MQ will understand that a message wasn't processed
 fully and will redeliver it to another consumer. That way you can be sure that no message is
 lost, even if the workers occasionally die.

 Message ack are turned on by default. {noack: false}
 */

var amqp = require("amqplib/callback_api");

function bail(err, conn) {
    console.log(err);
    if (conn) {
        conn.close(function () {
            process.exit(1);
        })
    }
}

function on_connect(err, conn) {
    if (err) return bail(err);
    var q = 'task_queue';
    conn.createChannel(function (err, ch) {
        if (err) return bail(err, conn);
        /**
         *  Message durability:
         *  When RMQ quits or crashes it will forget the queues and messages unless you tell
         *  it not bo.Two things are required to make sure that messages aren't lost:we need
         *  to mark both the queue and messages as durable.
         *
         *  First we need to make sure that RMQ will never lose our queue. In order to do so,
         *  we need to declare it as durable: {durable: true}
         *  note: RMQ doesn't allow you to redefine an existing queue with different parameters
         *        and will return an error to any program  that tries to do that.
         *
         */
        ch.assertQueue(q, {durable: true}, function (err, _ok) {
            if (err) return bail(err, conn);
            var msg = process.argv.slice(2).join(' ') || 'Hello World!';
            /**
             *  Now we need to mark our messages as persistent-by setting {persistent: true}
             */
            ch.sendToQueue(q, new Buffer(msg), {persistent: true});
            console.log('[x] sent %s', msg);
            ch.close(function () {conn.close()});
        });
    });

}
amqp.connect(on_connect);