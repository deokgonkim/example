#!/bin/bash

source <(./read-secrets.sh | sed s/^/"export "/)

echo $RDS_DEVELOP_PASSWORD
