#!/bin/bash

for I in $(cat lambda-versions-to-delete.txt)
do
echo "Deleting $I"
aws lambda delete-function --function-name $I
done

