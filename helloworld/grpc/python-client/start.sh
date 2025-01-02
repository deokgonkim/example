#!/bin/bash

TARGET=${1:-"localhost:50051"}
NAME=${2:-"dgkim"}

python -m my_client $TARGET $NAME
