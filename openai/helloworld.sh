#!/bin/bash

# OPENAI_API_KEY must be configured
# export OPENAI_API_KEY=secret...

openai api chat_completions.create -m gpt-3.5-turbo -g user "Hello world"
