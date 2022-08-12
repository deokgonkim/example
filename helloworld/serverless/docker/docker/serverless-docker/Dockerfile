FROM ubuntu:20.04

RUN apt update && apt install -y nodejs python3

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
