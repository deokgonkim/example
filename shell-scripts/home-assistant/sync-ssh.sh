#!/bin/bash

TARGET_HOST=backup.dgkim.net
TARGET_FOLDER=/data/body-detected

echo "Sync" `date` | tee -a /media/sync.log

if [ ! -f "/usr/bin/rsync" ]; then
echo "Installing rsync" | tee -a /media/sync.log
apk add rsync 2>&1 | tee -a /media/sync.log
fi

echo `id` | tee -a /media/sync.log

/usr/bin/rsync \
-avr \
--remove-source-files \
-e "ssh -oStrictHostKeyChecking=no -l dgkim -i /media/.id_rsa" \
/media/body-detected/* \
dgkim@$TARGET_HOST:$TARGET_FOLDER/ 2>&1 \
| tee -a /media/sync.log
#-oIdentity=/media/.id_rsa \
#-oStrictHostKeyChecking=no \
#--delete \

