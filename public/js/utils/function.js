function trimstr(str){
   var trimstr = "";
   for (var i=0; i<str.length;){
        if(str[i]!=" ")
            trimstr = trimstr + str[i];
        i++;
   }
   return trimstr;

}
