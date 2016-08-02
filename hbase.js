var hbase = require('hbase');

var client = hbase({
      host: '192.168.1.202',
      port:8090
})

exports.login = function(req, res){
     var username = req.body.username;
     var password = req.body.password;
     console.log(username+password);
     client.table('USER_INFO')
           .scan({
                   startRow: username+password, 
                   endRow: username+password, 
                   column: 'user:type',
                   maxVersions: 1
                }, function(err, rows){
                      console.log(rows);
                      if(rows.length){
                           req.session.username = username;
                           req.session.password = password;
                           req.session.type = rows[0].$.toString();
                           res.render('home');
                      }else{
                           res.redirect('login');
                      }        
                });
}

exports.insertSplitJarInfo = function(req,res){
    var splitName = req.body.splitName;
    var jarName = req.body.jarName.split('\\').pop();
    var timestamp = (new Date()).valueOf();
    var key = jarName +";"+ splitName;
    client.table('SPLITEMETHOND_INFO')
          .row()
          .put([{key:key, column:'splitMethond:splitName',$:splitName},
                {key:key, column:'splitMethond:jarName',$:jarName}  
           ],function(err, success){
                if(success)
                  res.json({success:true});
                else res.json({success:false, reason:err});
             })         
}


exports.getSplitMethond = function(req, res){
     client.table('SPLITEMETHOND_INFO')        
           .scan({
                 maxVersions:1
                }, function(err, rows){
                    if(err!=null){
                       res.json({initSuccess:false, reason:err});
                       console.log(err);
                    }
                    else{
                       var result = analyzeRows(rows);
                       res.json({initSuccess:true, result: result});
                    }                                                
                });         
}



exports.deleteSplitMethond = function(req, res){
      if(req.session.type == 'A'){
          var splitInfo = req.body.splitInfo;
          console.log(splitInfo);
          client.table('SPLITEMETHOND_INFO')
          .row(splitInfo)
          .delete(function(err, success){
               if(!success){
                   res.json({success: false, reason: "数据库删除错误"});
               }else{
                   var targetPath = __dirname + '/public/files/splitjars/';
                   var s0 = 'rm -f ' + targetPath + splitInfo.split(';')[0];
                   var exec = require('child_process').exec;
                   exec(s0,function(error, stdout, stderr){});
                   res.json({success:true});
               }
          })
      }else{
         res.json({success: false, reason: "没有删除权限"});
      }
}


exports.insertMPJarInfo = function(req, res){
     var mapreduceName = req.body.mapreduceName;
     var MPjarName = req.body.MPjarName.split('\\').pop();
     var otherInfo = req.body.otherInfo;
     var mainClass = otherInfo.split(';')[0];
     var path = otherInfo.split(';')[1];
     var extralParams = otherInfo.split(';')[2];
     var key = MPjarName + ';' + mapreduceName;
     client.table('MAPREDUCE_INFO')
          .row()
          .put([{key:key, column:'MPjarInfo:mapreduceName',$:mapreduceName},
                {key:key, column:'MPjarInfo:MPjarName',$:MPjarName},
                {key:key, column:'MPjarInfo:mainClass',$:mainClass},
                {key:key, column:'MPjarInfo:path',$:path},
                {key:key, column:'MPjarInfo:extralParams',$:extralParams}
           ],function(err, success){
                if(success)
                  res.json({configSuccess:true});
                else res.json({configSuccess:false, reason:err});
             })
}

exports.getMapReduceMethond = function(req, res){
     client.table('MAPREDUCE_INFO')
           .scan({
                 maxVersions:1
                }, function(err, rows){
                    if(err!=null){
                       res.json({initSuccess:false, reason:err});
                       console.log(err);
                    }
                    else{
                       
                       var result = analyzeRows(rows);
                       
                       res.json({initSuccess:true, result: result});
                    }
                });

}

exports.deleteMapReduceInfo = function(req, res){
  if(req.session.type == 'A'){
     var mapreduceJarInfo = req.body.mapreduceJarInfo;
     var MPjarName = mapreduceJarInfo.split(';')[0];
     var mapreduceName = mapreduceJarInfo.split(';')[1];
     var rowkey = MPjarName + ';' + mapreduceName;
     client.table('MAPREDUCE_INFO')
           .row(rowkey)
           .delete(function(err, success){
               if(!success){
                   res.json({success: false, reason: "数据库删除错误"});
               }else{
                   var targetPath = __dirname + '/public/files/mapreducejars/';
                   var s0 = 'rm -f ' + targetPath + MPjarName;
                   var exec = require('child_process').exec;
                   exec(s0,function(error, stdout, stderr){});
                   res.json({success:true});
               }              

           })
   }else{
       res.json({success: false, reason: "没有删除权限"});
   }
}


exports.insertSparkJarInfo = function(req, res){
     var sparkName = req.body.sparkName;
     var sparkjarName = req.body.sparkjarName.split('\\').pop();
     var otherInfo = req.body.otherInfo;
     var mainClass = otherInfo.split(';')[0];
     var path = otherInfo.split(';')[1];
     var extralParams = otherInfo.split(';')[2];
     var key = sparkjarName + ';' + sparkName;
     client.table('SPARK_INFO')
          .row()
          .put([{key:key, column:'sparkjarInfo:sparkName',$:sparkName},
                {key:key, column:'sparkjarInfo:sparkjarName',$:sparkjarName},
                {key:key, column:'sparkjarInfo:mainClass',$:mainClass},
                {key:key, column:'sparkjarInfo:path',$:path},
                {key:key, column:'sparkjarInfo:extralParams',$:extralParams}
           ],function(err, success){
                if(success)
                  res.json({configSuccess:true});
                else res.json({configSuccess:false, reason:err});
             })
}


exports.getSparkMethond = function(req, res){
     client.table('SPARK_INFO')
           .scan({
                 maxVersions:1
                }, function(err, rows){
                    if(err!=null){
                       res.json({initSuccess:false, reason:err});
                       console.log(err);
                    }
                    else{
                       
                       var result = analyzeRows(rows);
                       
                       res.json({initSuccess:true, result: result});
                    }
                });

}

exports.deleteSparkInfo = function(req, res){
  if(req.session.type == 'A'){
     var sparkJarInfo = req.body.sparkJarInfo;
     var sparkjarName = sparkJarInfo.split(';')[0];
     var sparkName = sparkJarInfo.split(';')[1];
     var rowkey = sparkjarName + ';' + sparkName;
     client.table('SPARK_INFO')
           .row(rowkey)
           .delete(function(err, success){
               if(!success){
                   res.json({success: false, reason: "数据库删除错误"});
               }else{
                   var targetPath = __dirname + '/public/files/sparkjars/';
                   var s0 = 'rm -f ' + targetPath + sparkjarName;
                   var exec = require('child_process').exec;
                   exec(s0,function(error, stdout, stderr){});
                   res.json({success:true});
               }              

           })
   }else{
       res.json({success: false, reason: "没有删除权限"});
   }
}

exports.getDetailInfo = function(req, res){
    var fileName = req.body.fileName;
    client.table('RAS_INFO')
          .scan({
                  startRow: fileName,
                  endRow: fileName,
                  column: 'RAS_BASE',
                  maxVersions: 1
                }, function(err, rows){
                      console.log(analyzeRows(rows));
                      if(rows.length){
                           var result = analyzeRows(rows);
                           res.json({success:true, result:result[0]});
                      }else{
                           res.json({success:false}); 
                      }
          });


}


exports.deleteDetailInfo = function(fileName){
    client.table('RAS_INFO')
          .row(fileName)
          .delete(function(err, success){
              
          })
}

//type:MapReduce/Spark
exports.insertTaskInfo = function(inputs, outputName, type){
    var inputsName ="";
    var input = inputs.split(',');
    input.forEach(function(name){
        inputsName = inputsName + name + " ";
    })
    console.log(inputsName);
    client.table('TASK_INFO')
       .row()
       .put([{key:outputName, column:"task:inputsName", $:inputsName},
             {key:outputName, column:"task:outputName", $:outputName},
             {key:outputName, column:"task:type", $:type}
         ],function(err,success){
         })

}

exports.getTaskInfo = function(name, callback){
   client.table('TASK_INFO')
           .scan({
                 startRow: name, 
                 endRow: name, 
                 column: 'task:inputsName',
                 maxVersions:1
                }, function(err, rows){
                    if(err!=null){
                       console.log(err);
                    }
                    else{                       
                       var result = rows[0].$.toString();
                       console.log("hbase result: "+result);
                       callback(result);
                    }
                });

}


//解析hbase查询结果
function analyzeRows(rows){
      //console.log(rows);
      var result = new Array();
      var length = rows.length;
      if(length>0){
            var key = rows[0].key.toString();
            var tempkey = key;
            for(var i=0; i<length; ){
                  var j = 0;
                  while(key == tempkey){
                      if(i+j>length-1){
                          tempkey = "";
                      }else{
                          if(rows[i+j+1] == null)
                             tempkey = "";
                          else  tempkey = rows[i+j+1].key.toString();
                          j++;
                      }
                  }
                  key = tempkey;
                  var map = new Map();
                  //var json;
                  for (var n=i; n<i+j; n++){
                         var column = rows[n].column.toString().split(':')[1];
                         var value = rows[n].$.toString();
                         map.set(column, value);                         
                  }
                  i = i+j;
                  //console.log(map, i, j);
                  result.push(map);
           }
           //console.log(result);
           var array = new Array();
           result.forEach(function(r){
               var json = {};
               r.forEach(function(m,n){
                   json[n] = m;
               })
               array.push(json);
           })
           //console.log(array);
           return array;
      }else
          return null;
}



