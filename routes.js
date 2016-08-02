exports.login = function(req,res){ 
    var username = req.body.username; 
    var password = req.body.password; 
    var mongodb = require('mongodb'); 
    mongodb.connect('mongodb://localhost:10001/test',function(err,conn){ 
        conn.collection('user',function(err,coll){ 
            coll.find({'username':username,'password':password}).toArray(function(err,results){ 
                if(results.length){ 
                    req.session.username = username; 
                    req.session.password = password;
                    req.session.type = results[0].type;                    
                    res.render('home');         
                }else{ 
                    console.log('error'); 
                    res.redirect('login'); 
                }     
                conn.close(); 
            }) 
        }) 
    }) 
};

exports.insertSplitJarInfo = function(req,res){
    var splitName = req.body.splitName;
    var jarName = req.body.jarName.split('\\').pop();
    var mongodb = require('mongodb');
    mongodb.connect('mongodb://localhost:10001/test', function(err, conn){
         conn.collection('splitJarInfo', function(err,coll){
               coll.insert({"splitName": splitName, "jarName": jarName},function(err, results){
                      // console.log(err);
                      // console.log(results);
                      res.json({success:true});
               })
        })
   })
};

exports.insertMPJarInfo = function(req, res){
     var mapreduceName = req.body.mapreduceName;
     var MPjarName = req.body.MPjarName.split('\\').pop();
     var otherInfo = req.body.otherInfo;
     var mainClass = otherInfo.split(';')[0];
     var path = otherInfo.split(';')[1];
     
     var mongodb = require('mongodb');
     mongodb.connect('mongodb://localhost:10001/test', function(err, conn){
         conn.collection('MPJarInfo', function(err,coll){
                coll.insert({"mapreduceName": mapreduceName, "MPjarName": MPjarName, "mainClass": mainClass, "path":path},function(err, result){
                      if(err !== null)
                          res.json({configSuccess: false});
                      else res.json({configSuccess: true});
                })   
         })
               
     })
}



exports.getSplitMethond = function(req, res){
     var mongodb = require('mongodb');
     mongodb.connect('mongodb://localhost:10001/test', function(err, conn){
         conn.collection('splitJarInfo', function(err,coll){
                coll.find().toArray(function(err, results){
                      console.log(results);
                      res.json({initSuccess:true, result: results});
                })        
         })

    })

}


exports.deleteSplitMethond = function(req, res){
      if(req.session.type = 'A'){
         var splitMethond = req.body.splitMethond;
         var mongodb = require('mongodb');
         mongodb.connect('mongodb://localhost:10001/test', function(err, conn){
         conn.collection('splitJarInfo', function(err,coll){
                coll.remove({'jarName':splitMethond});
           })

        })
        var targetPath = __dirname + '/public/files/splitjars/';
        var s0 = 'rm -f ' + targetPath + splitMethond;
        var exec = require('child_process').exec;
        exec(s0,function(error, stdout, stderr){});
        res.json({success:true}); 
      }else{
         res.json({success: false, reason: "没有删除权限"});
      }
}


exports.getMapReduceMethond = function(req, res){
     var mongodb = require('mongodb');
     mongodb.connect('mongodb://localhost:10001/test', function(err, conn){
         conn.collection('MPJarInfo', function(err,coll){
                coll.find().toArray(function(err, results){
                      res.json({initSuccess:true, result: results});
                })
         })

    })
}


exports.upload = function(req, res){
      var formidable = require('formidable'),
          util = require('util'),fs=require('fs');

      var form = new formidable.IncomingForm(),files=[],fields=[],docs=[];
      console.log('start upload');
      //设置连接超时
      req.connection.setTimeout(3600*1000);

      form.uploadDir = __dirname + '/public/files/uploadfiles/';

	form.on('field', function(field, value) {
		fields.push([field, value]);
	}).on('file', function(field, file) {
		console.log(field, file);
		files.push([field, file]);
		docs.push(file);


	//   	var types = file.name.split('.');
	//	var date = new Date();
	       //	var ms = Date.parse(date);
		fs.renameSync(file.path, __dirname + '/public/files/uploadfiles/'+file.name);
	}).on('end', function() {
		console.log('-> upload done');
		res.writeHead(200, {
			'content-type': 'text/plain'
		});
		var out={Resopnse:{
			'result-code':0,
			timeStamp:new Date(),
		},
		files:docs
		};
		var sout=JSON.stringify(out);
		res.end(sout);
	});

	form.parse(req, function(err, fields, files) {
		err && console.log('formidabel error : ' + err);

		console.log('parsing done');
	});

}



