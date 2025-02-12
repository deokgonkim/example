#!/bin/bash

mysql -h 127.0.0.1 -uroot -proot <<EOF
create database test_gin;
EOF
