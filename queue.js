var redis = require("redis");
var rclient = redis.createClient(6379, '127.0.0.1');

var hprose = require("./lib/hprose-nodejs-2.0.0/lib/hprose.js");
var client = hprose.Client.create("http://127.0.0.1:8888/");
client.timeout=6000000;
client.simple = true;
client.on('error', function(func, e){
      console.log(func, e);
});

var proxy = client.useService(['startJob', 'startSparkJob']);

function startJob(arr, callback){
   var a = arr.split('|');
   var type = a[0];
   var jarInfo = a[1];
   var j = jarInfo;
   var inputs = a[2];
   var outputName = a[3];
   var jarPath;
   var mainClass = jarInfo.split(';')[2];
   var path = jarInfo.split(';')[3];
   var extralParams = jarInfo.split(';')[4];
   console.log(arr+ " "+ inputs)
   if(type == 'MapReduceTask'){
       jarPath = __dirname + '/public/files/mapreducejars/';  
       var jarFile = jarPath + jarInfo.split(';')[0];
       proxy.startJob(jarFile, mainClass, path, extralParams, inputs, outputName, function(result){
          console.log(result);
          if(result == 1){
              hbase.insertTaskInfo(inputs,outputName, "MapReduceTask");
         }
     });     
   }
   if(type == 'SparkTask'){
       jarPath = __dirname + '/public/files/sparkjars/';
       var jarFile = jarPath + jarInfo.split(';')[0];
       proxy.startSparkJob(jarFile, mainClass, path, extralParams, inputs, outputName, function(result){
          console.log(result);
          if(result == 1){
              hbase.insertTaskInfo(inputs,outputName, "SparkTask");
          }
     });
   }
}


rclient.brpoplpush('queue','backup_queue',0,handleJob);

function handleJob(err,job) {
  startJob(job, function(){
      console.log(job);
      //rclient.brpoplpush('queue','backup_queue',0,handleJob);
  });
  rclient.brpoplpush('queue','backup_queue',0,handleJob); 
}



