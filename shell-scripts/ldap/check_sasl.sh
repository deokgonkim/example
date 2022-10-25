#!/bin/bash

HOST=$1

ldapsearch -H ldaps://$HOST/ -x -s base -b "" -LLL "+" | grep -i sasl

