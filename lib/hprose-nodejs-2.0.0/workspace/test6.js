var hprose = require('../lib/hprose');
var exec = require('child_process').exec;

var s0 = "ls /home/lyc/hadoopfile";

function hello(name, callback) {
    setTimeout(function() {
        callback("Hello " + name + "!");
    }, 10);
}

function splitService(request, callback){
    var req = request.split(' ');
    var hdfsInputPath = req[0];
    var size = req[1];
    var inputFile = req[2];
    var outputFile = req[3];
    var str0 = "rm -r /home/lyc/test/params;";
    var str1 = "echo "+size+" "+inputFile+" "+outputFile+" > /home/lyc/test/params;";
    var str2 = "java -jar /home/lyc/test/split.jar /home/lyc/test/params;";
    var str3 = "hadoop fs -put "+outputFile+" "+hdfsInputPath;
    console.log(str0+str1+str2+str3);
    exec(str0+str1+str2+str3, function(error, stdout, stderr){
          console.log("stdout:"+stdout);
          console.log("stderr:"+stderr);
       if (error !== null) {
          console.log("error:"+error);
          callback(0);
          return 0;
        }else{
	       callback(1);
	       return 1;
	    }
		
	});
}


function getFileDirection(callback){
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
        var output="output"+m;
        console.log(input);
		callback(input+";"+output);

        
        exec("mkdir /home/lyc/hadoopfile/"+input+";hadoop fs -mkdir "+input,function(error,stdout,stderr){
              if(error !== null){
                  console.log(error);
               }
              console.log("stdout:"+stdout);
              console.log("stderr:"+stderr);
         });
	 });
     
}

function startJob(info, callback){
    var message = info.split(';');
    console.log(message);
	
    var inputName = message[0];
    var outputName = message[1];
    var jarName = message[2];
    var className = message[3];
    var rootpath = "/user/root/";
    var rootClassPath = "com.xdc.";
    var input = rootpath+inputName+"/*/tileZip"

   // var s1 = "hadoop fs -put "+"/home/lyc/test/"+inputName+" "+inputName;
    var s2 = "hadoop jar /home/lyc/test/"+jarName+" "+rootClassPath+className+" "+input+" "+rootpath+outputName+" 7 y y";
    var s3 = "hadoop fs -get "+outputName+" /home/lyc/hadoopfile";
     exec(s2+";"+s3,function(error, stdout, stderr){
      console.log("stdout:"+stdout);
      console.log("stderr:"+stderr);
      if (error !== null) {
        console.log('exec error1: ' + error);
	//	callback(0);
               // return 0;
      }else{
	//   callback(1);
	  // return 1;
	  }
    });
    callback(1);
}

var server = hprose.Server.create("http://0.0.0.0:8080");
server.addAsyncFunction(hello);
server.addAsyncFunction(splitService);
server.addAsyncFunction(getFileDirection);
server.addAsyncFunction(startJob);
server.start();


