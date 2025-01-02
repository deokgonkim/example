# python-client

## Install dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Generate stub code

```bash
./generate.sh
# this will generate helloworld_pb2*.py file
# in this directory !!! dirty, but can't find a way to work with `my_client/hello_pb2*`
# https://github.com/grpc/grpc/issues/9575
```

## Run

```bash
./start.sh
```
