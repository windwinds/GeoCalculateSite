var redis = require("redis");
var client = redis.createClient(6379, '127.0.0.1');

client.lpush(['queue', 'task1', 'task2'], function(err, reply) {
    console.log(reply); //prints 2
})

client.linsert('queue',1,'task3',function(err, reply){
    console.log(reply);
})
