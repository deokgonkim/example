#!/bin/bash

# Google Docs WILL NOT BACKUPED

export S3_PATH=s3://dgkimnet/MyBackup

aws s3 sync --delete . $S3_PATH

LAST_SYNCED=last_synced_$(date +%Y%m%d%H%M%S).txt
touch $LAST_SYNCED && aws s3 cp $LAST_SYNCED $S3_PATH/ && rm $LAST_SYNCED
touch GOOGLE_DOCS_ARE_NOT_BACKUPED.txt && aws s3 cp GOOGLE_DOCS_ARE_NOT_BACKUPED.txt $S3_PATH/ && rm GOOGLE_DOCS_ARE_NOT_BACKUPED.txt

