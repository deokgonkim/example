#!/bin/bash

# uninstall published version
npm uninstall @deokgonkim/example-component-installable

# install local version
PACKAGE_PATH=../component-installable
LATEST=$(ls -1rt $PACKAGE_PATH/deokgonkim*.tgz | tail -1)
npm install $PACKAGE_PATH/$LATEST
