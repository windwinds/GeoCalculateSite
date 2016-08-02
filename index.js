var express = require('express');

var app = express();

var http = require('http');
var path = require('path');

var server = http.createServer(app);
server.setTimeout(3600*1000);

//handlebars view engine
var handlebars = require('express3-handlebars')
          .create({defaultLayout: 'main',
                   helpers: {
                              section: function(name, options){
                                  if(!this._sections) this._sections = {};
                                  this._sections[name] = options.fn(this);
                                  return null; 
                              }
                            }       
                  });

app.engine('handlebars',handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', 3000);

//use static middleware
app.use(express.static(__dirname + '/public'));

//use middleware
app.use(require('body-parser')());


//modle cache
app.set('view cache', true);

//session and cokie
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(session({
    secret: '12345',
    name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 3600*1000 },  //设置maxAge是80000ms，即1h后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));

//登陆拦截器
app.use(function(req, res, next){
    var url = req.originalUrl;
    if(url != "/login" && !req.session.username){
        return res.redirect("/login");
    }
    next();
});



//route
var routes = require('./routes.js');

var hbase = require('./hbase.js')

app.get('/login', function(req, res){
    res.render('login', {layout: null});

});

app.post('/login', hbase.login);


app.post('/getUser', function(req, res){
    res.json({ success: true,
               user:{
                     name:req.session.username,
                     type:req.session.type
                    }
             });
});


app.get('/logout', function(req, res){
    delete req.session.username;
    res.render('login', {layout: null});
});


app.get('/', function(req, res){
       //res.type('text/plain');
       //res.send('Meadowlark Travel');
       res.render('home');
});

app.get('/home', function(req, res){
      res.render('home');
});

app.get('/singleMapReduce', function(req, res){
      res.render('singleMapReduce');
});

app.get('/multiMapReduce', function(req, res){
      res.render('multiMapReduce');
});

app.get('/spark', function(req, res){
      if(req.session.type === 'A')
         res.render('spark');
      else  res.render('noright');
});

app.get('/downloadResult', function(req, res){
      res.render('downloadResult');
});

app.get('/config', function(req, res){
      if(req.session.type === 'A')
         res.render('config');
      else  res.render('noright');
});

app.get('/fileAccessConfig', function(req, res){
     res.render('fileAccessConfig');
});

app.get('/mapReduceConfig', function(req, res){
     res.render('mapReduceConfig');
});

app.get('/sparkConfig', function(req, res){
     res.render('sparkConfig');
});



//uploadfile
var formidable = require('formidable');
var fs = require('fs');
var TITLE = "please upload file";
var UPLOAD_FOLDER = '/home/lyc/test';
var uploadFileName;


var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var jarName;


app.get('/upload', function(req, res){
     res.render('upload',{title: TITLE});
});

//上传文件
/*app.post('/upload', multipartMiddleware,  function(req, res){           
            var targetPath = __dirname + '/public/files/uploadfiles/' + req.files.file.originalFilename;
            //重命名为真实文件名
            fs.rename(req.files.file.path, targetPath, function (err) {
                if (err) {
                    res.json({uploadSuccess: false});
                } else {
                    res.json({uploadSuccess: true});
                }
            });
        
});*/

app.post('/upload', routes.upload);

app.post('/upSplitJar', multipartMiddleware,  function(req, res){
            var targetPath = __dirname + '/public/files/splitjars/' + req.files.file.originalFilename;
           // 重命名为真实文件名 
            /*fs.rename(req.files.file.path, targetPath, function (err) {
                if (err) {
                    res.json({uploadSuccess: false});
                    console.log(err);
                } else {
                    res.json({uploadSuccess: true});
                }
            });*/
            var is = fs.createReadStream(req.files.file.path);
            var os = fs.createWriteStream(targetPath);
            is.pipe(os);
            is.on('end', function(){
                  fs.unlinkSync(req.files.file.path);
                  res.json({uploadSuccess: true});
            })

});

app.post('/configSplitJar',hbase.insertSplitJarInfo);


app.post('/uploadMRjar', multipartMiddleware,  function(req, res){
            var targetPath = __dirname + '/public/files/mapreducejars/' + req.files.file.originalFilename;
            var is = fs.createReadStream(req.files.file.path);
            var os = fs.createWriteStream(targetPath);
            is.pipe(os);
            is.on('end', function(){
                  fs.unlinkSync(req.files.file.path);
                  res.json({upMRjarSuccess: true});
            })

});


app.post('/configMPJar', hbase.insertMPJarInfo);


app.post('/uploadSparkjar', multipartMiddleware,  function(req, res){
            var targetPath = __dirname + '/public/files/sparkjars/' + req.files.file.originalFilename;
            var is = fs.createReadStream(req.files.file.path);
            var os = fs.createWriteStream(targetPath);
            is.pipe(os);
            is.on('end', function(){
                  fs.unlinkSync(req.files.file.path);
                  res.json({upSparkjarSuccess: true});
            })

});


app.post('/configSparkJar', hbase.insertSparkJarInfo);


//初始化切割方式
app.post('/splitMethondInit',hbase.getSplitMethond);

//删除切割方式
app.post('/deleteSplitMethond', hbase.deleteSplitMethond);

//获取上传的文件
var exec = require('child_process').exec;
app.post('/uploadInit', function(req, res){
     var targetPath = __dirname + '/public/files/uploadfiles/';
     var s0 = 'ls ' + targetPath;
     exec(s0,function(error, stdout, stderr){
            if(error !== null){
                 res.json({resultSuccess: false});
                 console.log(error);
            }else{
	         var list = stdout.split('\n');
                 res.json({resultSuccess: true, filesName: list});
            }
     });        
});

//删除上传的文件
app.post('/deleteFile', function(req, res){
     if(req.session.type === 'A'){
          var fileName = req.body.selectedFile;
          var targetPath = __dirname + '/public/files/uploadfiles/';
          var file = targetPath + fileName;
          var s0 = 'rm -f '+file;
          exec(s0,function(error, stdout, stderr){
            if(error !== null){
                 res.json({success: false, reason: stderr});
                 console.log(error);
            }else{
                 res.json({success: true});
            }
          });
     }    
     else{
           res.json({success: false, reason: "没有删除权限"});
     }

})

//删除切分后的文件
app.post('/deleteSplitedFile', function(req,res){
      var fileName = req.body.fileName;
      if(req.session.type == 'A'){
          hbase.deleteDetailInfo(fileName);
          var targetPath = __dirname + '/public/files/splitedfiles/';
          var file = targetPath + fileName;
          var s0 = 'rm -f -r ' + file;
          exec(s0, function(error, stdout, stderr){
               if (error !== null){
                    res.json({success: false, reason: stderr});
                    console.log(error);
               }else{
                   res.json({success:true});
               }
          })
      }else{
          res.json({success: false, reason: "没有删除权限"});
      }

})



//文件切分
app.post("/splitFile", function(req, res){
     //console.log(req.body.params);
     //req.connection.setTimeout(3600*1000);
     var params = req.body.params;
     var str = params.split(';');
     var size = str[0];
     var inputName = str[1];
     var outputName = str[2];    
     var isMoutain = str[3];
     var splitJarPath = __dirname + '/public/files/splitjars/';
     var jar = splitJarPath + req.body.splitMethond.split(';')[0];

     var inputFile = __dirname + '/public/files/uploadfiles/' + inputName;
     var outputFile = __dirname + '/public/files/splitedfiles/' + outputName;
     
     var paramsPath = __dirname + '/public/files/params/';
     var s0 =  "rm -r " + paramsPath + "params;";
     var s1 = "echo "+size+" "+inputFile+" "+outputFile+" "+isMoutain+" > "+paramsPath+"params;";
     var s2 = "java -jar " + jar + " " + paramsPath + "params";
     console.log(s0+s1+s2); 
     exec(s0+s1+s2, function(error, stdout, stderr){
         if(error !== null){
             console.log("error:"+error);
             res.json({success: false, result: stderr});
         }else{
             console.log("stdout:"+stdout);
             console.log("stderr:"+stderr);
             res.json({success: true, result: stdout});
         }
     });

});


//获取切片处理后的文件
app.post('/uptoHDFSfiles', function(req, res){
     var targetPath = __dirname + '/public/files/splitedfiles/';
     var s0 = 'ls ' + targetPath;
     exec(s0,function(error, stdout, stderr){
            if(error !== null){
                 res.json({afterSuccess: false});
                 console.log(error);
            }else{
                   //console.log(stdout);
                   var list = stdout.split('\n');
                   // console.log(list);
                   res.json({afterSuccess: true, filesName: list});
                 }
     });
});




app.post('/uploadJar', multipartMiddleware, function(req,res){
      var filename = req.files.file.originalFilename;
      jarName = filename;
      var targetPath = UPLOAD_FOLDER + '/' + filename;
      console.log(filename);
      console.log(targetPath);
      fs.rename(req.files.file.path, targetPath);
      res.json({success: true});
});


app.post('/MapReduceInit',hbase.getMapReduceMethond);

app.post('/deleteMapReduceJar', hbase.deleteMapReduceInfo);

app.post('/sparkInit',hbase.getSparkMethond);

app.post('/deleteSparkJar', hbase.deleteSparkInfo);

//得到栅格文件详细信息
app.post('/getDetailInfo',hbase.getDetailInfo);


//hprose client
//
//
//
//
//
//
var hprose = require("./lib/hprose-nodejs-2.0.0/lib/hprose.js");
var client = hprose.Client.create("http://192.168.1.202:8888/");
client.timeout=6000000;
client.simple = true;
client.on('error', function(func, e){
      console.log(func, e);
});

var proxy = client.useService(['uploadToHDFS','queryHDFSfile','deleteHDFSfile','getFileFromHDFS','startJob', 'startSparkJob']);
var HDFSDir;

////获取HDFS上的文件
app.post('/HDFSinit', function(req, res){
    var list = new Array(0);
    proxy.queryHDFSfile('', function(result){
        var infos = result.split('\n');
        //console.log(infos.length);
        for(var i=1; i<infos.length-1; i++){
             var fileName = infos[i].split('/').pop();
             //console.log(fileName);
             list.push(fileName);
        }
        res.json({success: true, filesName: list});
    });
    // res.json({success: true, filesName: list});
});


//ajax
app.post('/uploadtoHDFS', function(req, res){
     var selectedValue = req.body.selectedValue;
     console.log(selectedValue);
     var str = selectedValue.split(';');    
     var place = str[0];
     var fileName = str[1];
     var filePath;
     if(place == "before"){
         filePath = __dirname + '/public/files/uploadfiles/';  
     }else{
         filePath = __dirname + '/public/files/splitedfiles/';
     }
     var file = filePath + fileName;
     console.log(file); 
     proxy.uploadToHDFS(file, function(result){
           if(result == 1){
               console.log(result);
               res.json({toHDFSsuccess: true});
           }else{
               console.log(result);
               res.json({toHDFSsuccess: false, error: result});
           }
     });
})


app.post('/startJob', function(req, res){
     var jarInfo = req.body.jarInfo;
     var jarPath = __dirname + '/public/files/mapreducejars/';
     var jarFile = jarPath + jarInfo.split(';')[0];
     var mainClass = jarInfo.split(';')[2];
     var path = jarInfo.split(';')[3];
     var extralParams = jarInfo.split(';')[4];
     var inputs = req.body.selectedValues;
     var outputName = req.body.outputName;
     console.log(inputs);
     proxy.startJob(jarFile, mainClass, path, extralParams, inputs, outputName, function(result){
          console.log(result);
          if(result == 1){
              hbase.insertTaskInfo(inputs,outputName, "MapReduceTask");
              res.json({startJobSuccess: true}); 
          }
          else
              res.json({startJobSuccess: false, startResult: result});
     });
     
});


//通过消息队列提交任务
var redis = require("redis");
var RDS_PWD = 'my_redis';
var RDS_OPTS = {auth_pass:RDS_PWD}
var client = redis.createClient(6379, '192.168.1.202', RDS_OPTS);
app.post('/startJobByQueue', function(req, res){
      var type = req.body.jobType;
      var jarInfo = req.body.jarInfo;
      var inputs = req.body.selectedValues;
      var outputName = req.body.outputName;
      var arr = type + '|' + jarInfo + '|' + inputs + '|' + outputName;
      client.lpush(['queue',arr], function(err, reply){
         console.log(err);
         console.log(reply);
      });

})


app.post('/startSparkJob', function(req, res){
     var jarInfo = req.body.jarInfo;
     var jarPath = __dirname + '/public/files/sparkjars/';
     var jarFile = jarPath + jarInfo.split(';')[0];
     var mainClass = jarInfo.split(';')[2];
     var path = jarInfo.split(';')[3];
     var extralParams = jarInfo.split(';')[4];
     var inputs = req.body.selectedValues;
     var outputName = req.body.outputName;
     proxy.startSparkJob(jarFile, mainClass, path, extralParams, inputs, outputName, function(result){
          console.log(result);
          if(result == 1){
              res.json({startJobSuccess: true}); 
              hbase.insertTaskInfo(inputs,outputName, "SparkTask");
          }
          else
              res.json({startJobSuccess: false, startResult: result});
     });
     
});

app.post('/startDownload', function(req, res){
    var fileName = req.body.fileName;
    console.log(fileName);
    var savePath = __dirname + '/public/files/downloadfiles/';
    var file = savePath + fileName;
    //如果文件没有从HDFS中get下来
    var s0 = 'ls ' + savePath;
    exec(s0,function(error, stdout, stderr){
         var list = stdout.split('\n');
         var bool = 0;
         console.log(list);
         for(var i=0; i<list.length; i++){
              if(list[i] == fileName)
                  bool = 1; 
         }
         if(bool==0){
              proxy.getFileFromHDFS(fileName, savePath, function(result){
                    if (result !== 1)
                       res.json({isSuccess: false, reason: result});
                    else {
                       var str = "zip -r " + file + ".zip " + file + "/*";
                       console.log(str);
                       exec(str, function(error, stdout, stderr){
                            console.log(stdout);
                            console.log(stderr);
                            res.json({isSuccess: true});
                       }); 
                    }
              });
         }else{
             res.json({isSuccess: true});
         }
                 
    });
    
})

//将切割后的文件重写为栅格文件
app.post('/writeRas', function(req, res){
     var fileName = req.body.fileName;
     hbase.getTaskInfo(fileName, function(inputsName){
            var savePath = __dirname + '/public/files/downloadfiles/';
     var file = savePath + fileName;
     var s0 = 'ls ' + savePath;
     exec(s0,function(error, stdout, stderr){
           var list = stdout.split('\n');
         var bool = 0;
         console.log(list);
         for(var i=0; i<list.length; i++){
              if(list[i] == fileName)
                  bool = 1;
         }
         if(bool==0){
              proxy.getFileFromHDFS(fileName, savePath, function(result){
                    if (result !== 1)
                       res.json({isSuccess: false, reason: result});
                    else {
                       var jarPath = __dirname + '/public/files/writeGridjars/';
                       var jarName = 'restore.jar';
                       var jar = jarPath + jarName;
                       var file1 = "GTOPO30Elevation256"; 
                       var file2 = "GTOPO30Slope256";
                       var outputPath = __dirname + '/public/files/writeRasfiles/';
                       var outputfile = outputPath + fileName + ".ras"
                       var str = "java -jar "+ jar + " " + file + " "+ outputfile + " RAS_INFO " + inputsName + " 1.0f 6.0f";
                       console.log(str);
                       exec(str, function(error, stdout, stderr){
                            console.log(stdout);
                            console.log(stderr);
                            res.json({isSuccess: true});
                       });
                    }
              });
         }else{
                       var jarPath = __dirname + '/public/files/writeGridjars/';
                       var jarName = jarPath + 'restore.jar';
                       var jar = jarName;
                       var file1 = "GTOPO30Elevation256";
                       var file2 = "GTOPO30Slope256";
                       var outputPath = __dirname + '/public/files/writeRasfiles/';
                       var outputfile = outputPath + fileName + ".ras"
                       var str = "java -jar "+ jar + " " + file + " " + outputfile +" RAS_INFO "+inputsName+ " 1.0f 6.0f";
                       console.log(str);
                       exec(str, function(error, stdout, stderr){
                            console.log(stdout);
                            console.log(stderr);
                            res.json({isSuccess: true});
                       });
         }

     })          


     });


})


app.post('/deleteHDFSfile',function(req, res){
      var fileName = req.body.selectFile;
      proxy.deleteHDFSfile(fileName, function(result){
           if(result !== 1)
               res.json({success:false, reason: result});
           else
               res.json({success:true});
      }); 
})


app.get('/startDownload', function(req, res){
      var fileName = req.param("output");
      var path = req.param("path");
      console.log(path);
      var savePath = __dirname + path;
      res.attachment("output");
      res.download(savePath+fileName+".zip", fileName+".zip");
     // res.download(savePath+fileName+"/tileZip", "tileZip");
})


app.get('/downloadRas', function(req, res){
      var fileName = req.param("output");
      var path = req.param("path");
      console.log(path);
      var savePath = __dirname + path;
      res.attachment("output");
      res.download(savePath+fileName, fileName);

})


//read headers
app.get('/headers',function(req, res){
       res.set('Content-Type', 'text/plain');
       var s = '';
       for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
       res.send(s);
});


//404
app.use(function(req, res){
      //res.type('text/plain');
      res.status(404);
      //res.send('404 - Not Fount');
      res.render('404');
});

//505
app.use(function(err, req, res, next){
      console.error(err.stack);
      //res.type('text/plain');
      res.status(500);
      //res.send('500 - Server Error');
      res.render('505');
});

app.listen(app.get('port'),function(){
      console.log('Express started on http://192.168.1.202:'+app.get('port')+'; press Ctrl+C to terminate.');
});

