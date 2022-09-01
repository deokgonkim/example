FROM node:12

WORKDIR /app

COPY package*.json /app
RUN npm ci

COPY ./ /app

ENTRYPOINT ["/app/entrypoint.sh"]
