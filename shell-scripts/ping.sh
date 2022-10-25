#!/bin/bash

for i in {1..254}
do
ping -t 1 -c 1 192.168.0.${i} &
done

