var hprose = require("../lib/hprose.js");
var client = hprose.Client.create("http://127.0.0.1:8080/", ['getFileDirection']);
//client.simple = true;
//client.on('error', function(func, e){
//      console.log(func, e);
//});

//var proxy = client.useService(['hello','splitService','getFileDirection','startJob']);
var proxy = client.useService(['getFileDirection']);
//proxy.hello("liyongchang", function(result) {
//    console.log(result);
//});

//var inputLocation = "input0";
//proxy.splitService(inputLocation+" "+"256 /home/lyc/test/Hubei.ras /home/lyc/test/Hubei256",function(result){
//    console.log(result);


client.getFileDirection(function(result){
      console.log(result);
});

proxy.startJob("input;output;jarName;className",function(result){
      if(result==1){
         console.log("success");
      }else{
         console.log("fail"); 
      }
   }
);
console.log("finish");
