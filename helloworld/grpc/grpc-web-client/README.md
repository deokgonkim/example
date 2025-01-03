# grpc-web-client

## Install protoc, protoc-js, protoc-gen-grpc-web

- protoc
  - https://github.com/protocolbuffers/protobuf/releases
  - copy `protoc` binary to $HOME/bin
- protoc-js
  - https://github.com/protocolbuffers/protobuf-javascript/releases
  - copy `protoc-gen-js` binary to $HOME/bin
- protoc-gen-grpc-web
  - https://github.com/grpc/grpc-web/releases
  - copy `protoc-gen-grpc-web` binary to $HOME/bin

## Generate stub file

```bash
./generate.sh
# this will create src/generated/helloworld*.js
```

## Compile web

```bash
npm run build
```

## Run

```bash
docker-compose up
```

open browser http://localhost


## Reference

- https://github.com/grpc/grpc-web/tree/master/net/grpc/gateway/examples/helloworld
