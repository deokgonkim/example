#!/bin/bash

# to prevent docker to pickup 172.31.0.0/16
docker network \
create \
--subnet 172.31.253.0/30 \
aws_vpc

