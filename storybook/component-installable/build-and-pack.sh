#!/bin/bash

npm run build && npm pack

# create documentation
npm run doc
npm run build-storybook
