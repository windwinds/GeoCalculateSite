var sys = require('sys');
var exec = require('child_process').exec;

var inputName = "input0";
var outputName = "output0";
var jarName = "hadoop-examples-1.0.1.jar";
var className = "wordcount";

var s1 = "/usr/hadoop-2.6.0/bin/hadoop fs -put /usr/hadoop-2.6.0/local/"+inputName+"/* "+inputName;
var s2 = "/usr/hadoop-2.6.0/bin/hadoop jar /usr/hadoop-2.6.0/jar/"+jarName+" "+className+" "+inputName+" "+outputName;
var s3 = "/usr/hadoop-2.6.0/bin/hadoop fs -get "+outputName+" /usr/hadoop-2.6.0/local";



exec(s1+";"+s2+";"+s3,function(error, stdout, stderr){
      sys.print("stdout:"+stdout);
	  sys.print("stderr:"+stderr);
  }
);


