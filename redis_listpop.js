var redis = require("redis");
var RDS_PWD = 'my_redis';
var RDS_OPTS = {auth_pass:RDS_PWD}
var client = redis.createClient(6379, '192.168.1.202', RDS_OPTS);


client.brpoplpush('queue','backup_queue',0,handleJob);

function handleJob(err,job) {
    console.log(job);
    client.brpoplpush('queue','backup_queue',0,handleJob);
}

