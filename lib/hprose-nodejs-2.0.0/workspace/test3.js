var num = new Array();
var n = 0;
var list = ["input0","output0","input10","output10","input2", "input111", "input9"];
for(var i=0; i<list.length; i++){
  
  if(list[i].substring(0,5)=="input"){
    console.log(list[i].substring(5,list[i].length));
    num[n]=parseInt(list[i].substring(5,list[i].length));
    n++;
  }
}
console.log("....");
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
