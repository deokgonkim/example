#!/bin/bash

aws lambda invoke --function-name cpp-lambda-hello --payload '{ }' output.txt
