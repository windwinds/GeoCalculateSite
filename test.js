var exec = require('child_process').exec;

var str = "ls /root/nodeTest/hadoopSite/public/files/uploadfiles";

exec(str, function(error, stdout, stderr){
    console.log(stdout);

});

  var mongodb = require('mongodb'); 
  mongodb.connect('mongodb://localhost:10001/test',function(err,conn){ 
    conn.collection('test_insert',function(err,coll){
       coll.find({"username":"lyc","password":"123456","type":"ordinary"}).toArray(function(err,results){
            if(err){
                console.log(err);
            } 
            if(results.length){ 
               //res.redirect('/'); 
               console.log('success');
            }else{ 
               // res.redirect('/users'); 
               console.log('fail');
            } 
            conn.close(); 
        }) 
    }) 
   
  }) 
 // console.log(req.body.username)
