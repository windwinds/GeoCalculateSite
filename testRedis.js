var redis = require("redis");
var client = redis.createClient(6379, '127.0.0.1', {connect_timeout: 10});

//订阅一个频道
var sub = function(c) {
    var c = c || 'a nice channel';
    client.subscribe(c,function(e){
        console.log('strting subscribe channel:'+c);
    });
};
sub();

//错误处理
client.on('error',function(error) {
    console.log(error);
    sub();
});

//订阅处理函数
client.on('message',function(err,response){
    console.log(response);
});
