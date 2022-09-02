#!/bin/bash

source env.sh

for I in {1..20}
do

    export MESSAGE='
    {
        "id": '$I',
        "message": "'$I' message"
    }
    '

    aws sqs send-message \
    --queue-url $QUEUE_URL \
    --message-body "$MESSAGE" &
done
