#!/bin/bash

# Usage
# ./ldapwhoami.sh ldap.example.com uid=dgkim,dc=example,dc=com

HOST=$1
BINDDN=$2

#ldapwhoami -H ldapi:/// -Y EXTERNAL
ldapwhoami -H ldaps://$HOST/ -x -D $BINDDN -W

