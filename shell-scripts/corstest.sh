#!/bin/bash

ORIGIN=$1
TARGET=$2

curl -v \
-X OPTIONS \
-H "Origin: $ORIGIN" \
-H "Access-Control-Request-Method: GET" \
$TARGET

