#!/bin/bash

sudo route delete -net 192.168.0.0/24
sudo route add -net 192.168.0.0/24 -interface en1
