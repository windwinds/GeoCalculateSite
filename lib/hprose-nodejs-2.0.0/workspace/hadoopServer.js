var hprose = require('../lib/hprose');
var exec = require('child_process').exec;

var HDFSsavePath = "/user/lyc/";

function uploadToHDFS(request, callback){
   var str = "hadoop fs -put "+request + " " +HDFSsavePath;
   console.log(str);
   exec(str, function(error, stdout, stderr){
       console.log("stdout: "+stdout);
       console.log("stderr: "+stderr);
       if(error !== null){
           console.log("error:"+error);
           callback(stderr);
       }else{
           callback(1);
       }
   })

}

function queryHDFSfile(request,callback){
    var str = "hadoop fs -ls " + HDFSsavePath;
    exec(str, function(error, stdout, stderr){
       // console.log("stdout: "+stdout);
       // console.log("stderr: "+stderr);
       callback(stdout);
   });
}

function startJob(jarFile, mainClass, path, extralParams, inputs, outputName, callback){
    
    var inputNum = inputs.split(',').length;
    var params="";
    if(extralParams!=null && extralParams!=""){
        for(var i=0;i<extralParams.split(',').length;i++){
          params+=extralParams.split(',')[i]+" ";
        }
    }i
		
	var inputfiles="";
	for(var i=0; i<inputNum; i++){
	    var inputfile = HDFSsavePath + inputs.split(',')[i] + path + " ";
		inputfiles += inputfile;
	}
	
	var str = "hadoop jar "+ jarFile + " " + mainClass +" "+ inputfiles + HDFSsavePath  + outputName + " "+params;
	
	console.log(str);
    exec(str, function(error, stdout, stderr){
        if(error !== null)
            callback(stderr);
        else
            callback(1);
    });	
    setTimeout(function(){callback(1)}, 5000);
}

function startSparkJob(jarFile, mainClass, path, extralParams, inputs, outputName, callback){
    var inputNum = inputs.length;
    var params="";
    if(extralParams!=null && extralParams!=""){
        for(var i=0;i<extralParams.split(',').length;i++){
          params+=extralParams.split(',')[i]+" ";
        }
    }
		
	var inputfiles="";
	for(var i=0; i<inputNum; i++){
	    var inputfile = HDFSsavePath + inputs[i] + path + " ";
		inputfiles += inputfile;
	}
	
        var outputfile = HDFSsavePath  + outputName;
        var applicationName = "";
       
        applicationName = "spark_" + inputs;
      
        //xie si
        var input0 = HDFSsavePath + inputs.split(',')[0]+path;
        var input1 = HDFSsavePath + inputs.split(',')[1]+path;
	var str = "spark-submit --class " + mainClass + " --name " + applicationName + " --master yarn-cluster --num-executors "+params+" " + jarFile + " -e "+input0 +" -s "+input1+ " -o " + outputfile;
	
	console.log(str);
    exec(str, function(error, stdout, stderr){
        if(error !== null)
            callback(stderr);
        else
            callback(1);
    });
    setTimeout(function(){callback(1)}, 5000);	
}


function getFileFromHDFS(fileName,savePath, callback){
      var str = "hadoop fs -get " + HDFSsavePath  + fileName + " " + savePath;
      console.log(str);
      exec(str, function(error, stdout, stderr){
            if(error !== null)
                callback(stderr);
            else
                callback(1);
      });

}

function deleteHDFSfile(fileName, callback){
      var str = "hadoop fs -rm -r -f " + HDFSsavePath + fileName;
      exec(str, function(error, stdout, stderr){
            if(error !== null)
                callback(stderr);
            else callback(1);
      })

}


var server = hprose.Server.create("http://0.0.0.0:8888");
server.timeout=6000000;
server.addAsyncFunction(uploadToHDFS);
server.addAsyncFunction(queryHDFSfile);
server.addAsyncFunction(startJob);
server.addAsyncFunction(getFileFromHDFS);
server.addAsyncFunction(deleteHDFSfile);
server.addAsyncFunction(startSparkJob);
server.start();



   

   
