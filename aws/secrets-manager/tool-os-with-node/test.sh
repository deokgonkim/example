#!/bin/bash

source <(./read-secrets.sh | sed s/^/"export "/)

env | nl

echo $RDS_DEVELOP_PASSWORD
