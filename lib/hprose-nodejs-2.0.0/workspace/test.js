var sys = require('sys')

var exec = require('child_process').exec;

 //executes `pwd`

 exec("ls /usr/hadoop-2.6.0/local", function (error, stdout, stderr) {
        if(stdout !== null){
             sys.print("stdout1:"+stdout);
        } 
        if (stderr !== null) {
             sys.print("stderr1:"+stderr);
        }
        if (error !== null) {
             console.log('exec error1: ' + error);
        }
     }
   );

var inputName = "input0";
var outputName = "output0";
var jarName = "hadoop-examples-1.0.1.jar";
var className = "wordcount";

exec("/usr/hadoop-2.6.0/bin/hadoop fs -put /usr/hadoop-2.6.0/local/"+inputName+"/* "+inputName,function(error, stdout, stderr){
      sys.print("stdout2:"+stdout);
  }
);

exec("/usr/hadoop-2.6.0/bin/hadoop jar /usr/hadoop-2.6.0/jar/"+jarName+" "+className+" "+inputName+" "+outputName,function(error, stdout, stderr){
      sys.print("stdout3:"+stdout);
  }
);

exec("/usr/hadoop-2.6.0/bin/hadoop fs -get "+outputName+" /usr/hadoop-2.6.0/local/"+outputName,function(error, stdout, stderr){
      sys.print("stdout4:"+stdout);
  }
);





