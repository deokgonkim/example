#!/bin/bash

echo "Log Group Name : "
export LOG_GROUP_NAME=$(read p; echo $p)

echo "Filter pattern : "
export FILTER_PATTERN=$(read p; echo $p)

#echo "Start Time in unixtime : "
#export START_TIME=$(read p; echo $p)
echo "Start Time in YYYY-MM-DD HH:mm:ss : "
export T=$(read p; echo $p)

export START_TIME=$(date -j -f "%Y-%m-%d %T" "$T" "+%s000")

#echo "End Time in unixtime : "
#export END_TIME=$(read p; echo $p)
echo "End Time in YYYY-MM-DD HH:mm:ss : "
export T=$(read p; echo $p)

export END_TIME=$(date -j -f "%Y-%m-%d %T" "$T" "+%s000")

#echo "# $START_TIME $END_TIME"

echo "File name for output : "
export FILENAME=$(read p; echo $p)

CMD="aws logs filter-log-events --log-group-name $LOG_GROUP_NAME"

if [ "x$FILTER_PATTERN" != "x" ]; then
    CMD="$CMD --filter-pattern $FILTER_PATTERN"
fi
if [ "x$START_TIME" != "x" ]; then
    CMD="$CMD --start-time $START_TIME --end-time $END_TIME"
fi
if [ "x$FILENAME" != "x" ]; then
    $CMD > $FILENAME
else
    $CMD
fi

