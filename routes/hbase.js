var hbase = require('hbase');

var client = hbase({
      host: '127.0.0.1',
      port:8080
})

exports.login = function(req, res){
     var username = req.body.username;
     var password = req.body.password;
     client.table('USER_INFO')
           .scan({
                   startRow: username+password, 
                   endRow: username+password, 
                   column: 'user:type',
                   maxVersions: 1
                }, function(err, rows){
                      //console.log(rows);
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
    var key = splitName +";"+ jarName;
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
               }
          })
          var targetPath = __dirname + '/public/files/splitjars/';
          var s0 = 'rm -f ' + targetPath + splitInfo.split(';')[0];
          var exec = require('child_process').exec;
          exec(s0,function(error, stdout, stderr){});
          res.json({success:true});
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
     var timestamp = (new Date()).valueOf();
     var key = mapreduceName + ";" + MPjarName;
     client.table('MAPREDUCE_INFO')
          .row()
          .put([{key:key, column:'MPjarInfo:mapreduceName',$:mapreduceName},
                {key:key, column:'MPjarInfo:MPjarName',$:MPjarName},
                {key:key, column:'MPjarInfo:mainClass',$:mainClass},
                {key:key, column:'MPjarInfo:path',$:path}
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
                       console.log(result);
                       res.json({initSuccess:true, result: result});
                    }
                });

}




//解析hbase查询结果
function analyzeRows(rows){
      var result = new Array();
      var length = rows.length;
      if(length>0){
            var key = rows[0].key.toString();
            var tempkey = key;
            for(var i=1; i<length; ){
                  var j = 0;
                  while(key == tempkey){
                      if(i+j>length-1){
                          tempkey = "";
                      }else{
                          tempkey = rows[i+j].key.toString();
                          j++;
                      }
                  }
                  key = tempkey;
                  var map = new Map();
                  //var json;
                  for (var n=i-1; n<i+j; n++){
                         var key = rows[n].key.toString();
                         var column = rows[n].column.toString().split(':')[1];
                         var value = rows[n].$.toString();
                         map.set(column, value);                         
                  }
                  i = i+j;
                  result.push(map);
           }
           var array = new Array();
           result.forEach(function(r){
               var json = {};
               r.forEach(function(m,n){
                   json[n] = m;
               })
               array.push(json);
           })
           return array;
      }else
          return null;
}



