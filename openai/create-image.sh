#!/bin/bash

echo "Arguments $@"

if [ -z "$1" ]; then
    echo "Enter description"
    read DESC
else
    DESC="$@"
fi

openai api image.create -p "$DESC" -n 1
