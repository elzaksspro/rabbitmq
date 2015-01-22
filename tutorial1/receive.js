var amqp = require("amqplib");
amqp.connect('amqp://localhost').then(function (conn) {
    process.once('SIGINT', function () {
        conn.close();
    });

    return conn.createChannel().then(function (ch) {
       var ok = ch.assertQueue('hello', {durable: false});

        ok = ok.then(function (_qok) {
           return ch.consume('hello', function (msg) {
               console.log('received:', msg.content.toString());
           }, {noAck: true});
        });

        return ok.then(function (_consumeOk) {
            console.log('warting for message. To exit press ctrl + c');
        });
    });
}).then(null, console.warn);