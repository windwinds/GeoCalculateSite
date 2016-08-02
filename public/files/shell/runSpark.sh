if [ $# -lt 5 ]
then 
  echo "Usage: [class] [jars] [data] [excutor] [output] "
  exit
fi
class=$1
jars=$2
data=$3
excutor=$4
output=$5

cmd="time spark-submit --class ${class} --name yarn-client${data}${excutor} --master yarn-client ${excutor} ${jars} -e ${data} -o ${output}"
echo ${cmd}
