FROM nginx:latest

COPY doc/index.html /usr/share/nginx/html
COPY set-version.sh /

ARG API_VERSION
ENV API_VERSION=$API_VERSION

RUN /set-version.sh
