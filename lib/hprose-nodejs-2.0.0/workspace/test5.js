e = require('../lib/hprose');
var exec = require('child_process').exec;
var s0 = "ls /home/lyc/hadoopfile";

function getFileDirection(request){
     var num = new Array();
         var n = 0;
     exec(s0,function(error, stdout, stderr){
             var list = stdout.split('\n');
                 for(var i=0; i<list.length; i++){

           if(list[i].substring(0,5)=="input"){
             console.log(list[i].substring(5,list[i].length));
             num[n]=parseInt(list[i].substring(5,list[i].length));
             n++;
           }
        }
      if(n>0){
        var max = num[0];
        for(var i=1; i<num.length; i++){
           if(max<num[i]){
           max=num[i];
           }
        }
        var m=max+1;
      }else{
        var m=0;
      }
        var input="input"+m;
        console.log(input);
            
        exec("mkdir /home/lyc/hadoopfile/"+input+";hadoop fs -mkdir "+input,function(error,stdout,stderr){
              if(error !== null){
                  console.log(error);
               }
              console.log("stdout:"+stdout);
              console.log("stderr:"+stderr);
             
         });
         });
         var r = input + "/";
         return r;
}

var server = hprose.Server.create("http://0.0.0.0:8080");
server.addFunction(getFileDirection);
server.start();

