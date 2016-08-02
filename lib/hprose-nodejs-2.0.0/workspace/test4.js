var hprose = require("../lib/hprose");
var sys = require('sys');
var exec = require('child_process').exec;

var inputName = "input0";
var outputName = "output0";
var jarName = "hadoop-examples-1.0.1.jar";
var className = "wordcount";

var s0 = "ls /usr/hadoop-2.6.0/local";
var s1 = "/usr/hadoop-2.6.0/bin/hadoop fs -put /usr/hadoop-2.6.0/local/"+inputName+"/* "+inputName;
var s2 = "/usr/hadoop-2.6.0/bin/hadoop jar /usr/hadoop-2.6.0/jar/"+jarName+" "+className+" "+inputName+" "+outputName;
var s3 = "/usr/hadoop-2.6.0/bin/hadoop fs -get "+outputName+" /usr/hadoop-2.6.0/local";


var num = new Array();
	 var n = 0;
     exec(s0,function(error, stdout, stderr){
	     var list = stdout.split('\n');
	for(var i=0; i<list.length; i++){

           if(list[i].substring(0,5)=="input"){
            //console.log(list[i].substring(5,list[i].length));
             num[n]=parseInt(list[i].substring(5,list[i].length));
             n++;
           }
        }
        console.log(num);
        var max = num[0];
        for(var i=1; i<num.length; i++){
           if(max<num[i]){
           max=num[i];
           }
        }
        var m=max+1;
        var input="input"+m;
        console.log(input);
	 });
