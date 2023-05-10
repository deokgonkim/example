#!/bin/bash

rm -Rf node_modules/sharp

# SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --save-dev --arch=x64 --platform=linux sharp
npm install --save --arch=x64 --platform=darwin sharp

ls -l node_modules/sharp/vendor/*/darwin-x64/lib
