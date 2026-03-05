#!/bin/bash
#
# Find packages that is installed from ppa

NAME_TO_FIND=$1

if [ -z "$NAME_TO_FIND" ]; then
    PATTERN="ppa.launchpad"
else
    PATTERN="ppa.launchpad.*${NAME_TO_FIND}"
fi

apt list --installed 2>/dev/null | cut -d/ -f1 | \
while read pkg; do
    apt-cache policy "$pkg" | grep -q $PATTERN && echo "$pkg"
done

