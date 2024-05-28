# https://stackoverflow.com/questions/76109982/installing-specific-version-of-nodejs-and-npm-on-alpine-docker-image

ARG NODE_VERSION=18.16.0

FROM node:${NODE_VERSION}-alpine AS node

FROM raonigabriel/web-terminal:latest

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

RUN node -v

# RUN npm install -g yarn --force

# RUN yarn -v

# CMD ["node", "path/to/your/script.js"]
