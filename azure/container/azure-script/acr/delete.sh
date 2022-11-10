#!/bin/bash

source env.sh

export NAME=dgkimtestregistry1

az acr \
delete \
--name $NAME

