var hprose = require('../lib/hprose');
var exec = require('child_process').exec;

var s0 = "ls /home/lyc/hadoopfile";

function hello(name) {
   // setTimeout(function() {
   //     callback("Hello " + name + "!");
   // }, 10);
   return  "Hello " + name + "!";
}

//数据划分、文件重组，并提交到hdfs上的服务
function splitService(request){
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
          callback(error);
        }else{
	        return stdout +'\n' +stderr;
	    }
		
	});
}

//将文件上传到HDFS上，参数为待上传的文件的路径
function uploadtoHDFS(request){
   var str = "hadoop fs -put "+request+" /";
   console.log(str); 
   exec(str, function(error, stdout, stderr){
       console.log("stdout: "+stdout);
       console.log("stderr: "+stderr);
       if(error !== null){
           console.log("error:"+error);
           return "error";
       }else{
           return 1;
       }
   })

}


//获取已经上传到HDFS上的文件
function queryHDFSfile(request){
    var str = "hadoop fs -ls /";
    var result = new Array();
    exec(str, function(error, stdout, stderr){
       console.log("stdout: "+stdout);
       // console.log("stderr: "+stderr);
       result.push(stdout);
       console.log(result);
       return result;
   });

}

function getFileDirection(){
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
	//return input
        //创建本地input目录和hdfs目录
        exec("mkdir /home/lyc/hadoopfile/"+input+";hadoop fs -mkdir "+input,function(error,stdout,stderr){
              if(error !== null){
                  console.log(error);
               }
              console.log("stdout:"+stdout);
              console.log("stderr:"+stderr);
  
              return "end";              
         });
	 });
     
}

function startJob(info){
	var message = info.split(';');
	console.log(message);
	
	var inputName = "input0";
    var outputName = "output0";
    var jarName = "hadoop-examples-1.0.1.jar";
    var className = "wordcount";

    var s1 = "hadoop fs -put /home/lyc/hadoopfile/"+inputName+"/* "+inputName;
    var s2 = "hadoop jar /home/lyc/hadoopfile/jar/"+jarName+" "+className+" "+inputName+" "+outputName;
    var s3 = "hadoop fs -get "+outputName+" /home/lyc/hadoopfile";
     exec(s1+";"+s2+";"+s3,function(error, stdout, stderr){
      console.log("stdout:"+stdout);
      console.log("stderr:"+stderr);
      if (error !== null) {
        console.log('exec error1: ' + error);
		return 0;
      }else{
	    return 1;
	  }
    });
    
}

var server = hprose.Server.create("http://0.0.0.0:8080");
server.addFunction(hello);
server.addFunction(uploadtoHDFS);
server.addFunction(queryHDFSfile);
server.addFunction(splitService);
server.addFunction(getFileDirection);
server.addFunction(startJob);
server.start();

