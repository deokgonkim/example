#!/bin/bash

# Get the Git tag or commit hash
GIT_VERSION=$(git describe --tags --always || git rev-parse HEAD --short)

# Get the current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# Sanitize the branch name by replacing slashes with dashes (if necessary)
BRANCH_NAME_SANITIZED=$(echo "$BRANCH_NAME" | tr '/' '-')

if [ "$BRANCH_NAME" = "develop" -o "$BRANCH_NAME" = "master" -o "$BRANCH_NAME" = "main" ]; then
    # If the branch name is "develop" or "master", use the branch name as is
    echo "$GIT_VERSION"
else
    # Combine the Git version and sanitized branch name into the final version string
    VERSION_STRING="${GIT_VERSION}-${BRANCH_NAME_SANITIZED}"

    # Print the final version string
    echo "$VERSION_STRING"
fi
