#!/bin/bash

echo "What time should I notify you?"
read AT

echo "What should I notify you?"
read TEXT

echo "Confirm or cancel(by Ctrl+C)"
read Y

echo "notify-send \"$TEXT\"" | at $AT && atq && echo "scheduled"

