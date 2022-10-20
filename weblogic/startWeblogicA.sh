#!/bin/ksh
USER_NAME=wls
DOMAIN_NAME=www_domain
SERVER_NAME=AdminServer
ADMIN_URL=t3://192.168.0.1:7001
DOMAIN_HOME=/oracle/wls/bea/user_projects/domains/www_domain
LOG_DIR=${DOMAIN_HOME}/servers/${SERVER_NAME}/logs
LOG_NAME=${SERVER_NAME}

#Check User Name
IAM=`id | awk '{print substr($1, 1, index($1,")")-1 )}' | awk '{print substr($1, index($1,"(")+1 )}'`

#Check startup user validation
if [ $USER_NAME != $IAM ]
then
echo "Startup Error : [SALT-WLS001] User validation is failed. This instance has been started as \"$IAM\", actual script owner is \"$USER_NAME\""
exit
fi

#Check process status
PID=`ps -ef|grep java|grep :${DOMAIN_NAME}_${SERVER_NAME} |awk '{print $2}'`
if [ "$PID" != "" ]
then
echo "Startup Error : [SALT_WLS002] \"${DOMAIN_NAME}_${SERVER_NAME}\"server is already running !!!"

exit
fi

############### Creat Log Directory ##################
mkdir -p $LOG_DIR
mkdir -p $LOG_DIR/stdout
mkdir -p $LOG_DIR/stdout/backup
mkdir -p $LOG_DIR/wls
mkdir -p $LOG_DIR/heapdump
mkdir -p $LOG_DIR/gc

mv $LOG_DIR/stdout/$LOG_NAME.log $LOG_DIR/stdout/backup/$LOG_NAME.log.'date'+20%y%m%d_%H%M%S''

############### Custom Args Start ####################
#Common start Args (8.x 일 경우 MEM_ARGS="${USER_MEM_ARGS}" 를 startWebLogic.sh 맨 밑 echo 윗부분에 추가 한다.)
USER_MEM_ARGS="-D:${DOMAIN_NAME}_${SERVER_NAME} -Xms256M -Xmx512M -XX:MaxPermSize=128m"
#64bit JDK
##only HP
#USER_MEMARGS="${USER_MEM_Args} -d64"

#GC (not setted)

#GC Log
## General
#USER_MEM_ARGS="${USER_MEM_ARGS} -verbose:gc -Xloggc:=${LOG_DIR}/gc/${SERVER_NAME}_GC_'date '+%y%m%d_%H%M%S''.gc"

##HP only
#USER_MEM_ARGS="${USER_MEM_ARGS} -Xverbosegc:file=${LOG_DIR}/gc/${SERVER_NAME}_GC_'date '+%y%m%d_%H%M%S''.gc"

##only IBM
#USER_MEM_ARGS="${USER_MEM_ARGS} -Xverbosegclog:${LOG_DIR}/gc/${SERVER_NAME}_GC_'date '+%y%m%d_%H%M%S''.gc"

#HeapDump
## hp : over 1.4.2.10 or over 1.5.0.03
## sun : over 1.4.2_10 or over 1.5.0_07
# USER_MEM_ARGS="${USER_MEM_ARGS} -XX: +HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=${LOG_DIR}/heapDump"

##IBM only ( kill -3 &lt;pid&gt; makes heap dump setting)
#export IBM_HEAPDUMP=true
#export IBM_HEAP_DUMP=true
#export IBM_HEAPDUMP_OUTOFMEMORY=true
#export IBM_JAVADUMP_OUTOFMEMORY=true
#export IBM_HEAPDUMPDIR=${LOG_DIR}/heapdump
#export IBM_JAVACOREDIR=${LOG_DIR}/heapdump

#Jconsole using
#USER_MEM_ARGS="${USER_MEM_ARGS} -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=8999 -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=false"

#Common end Args
export USER_MEM_ARGS
################# Custom Args End ###################

nohup ${DOMAIN_HOME}/bin/startWebLogic.sh &gt;&gt; ${LOG_DIR}/stdout/${LOG_NAME}.log &amp;

#8.x용 (bin/startWebLogic.sh가 없음)
#nohup ${DOMAIN_HOME}/startWebLogic.sh &gt;&gt; ${LOG_DIR}/stdout/${LOG_NAME}.log &amp;

sleep 2
tail -f $LOG_DIR/stdout/$LOG_NAME.log
