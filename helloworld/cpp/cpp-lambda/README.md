# cpp-lambda

AWS Lambda function written with c++

## Install requirements on Mac OS

**Gave up** there is too many to prepare Development environment on Apple M1.

```bash
brew install cmake
```

## Install requirements on Linux

```bash
sudo apt install cmake
sudo apt install libcurl4-openssl-dev # on my Ubuntu 22.04
```

## Download and build AWS Lambda runtime

- `prepare-aws-lambda.sh` : will download and install into `./bin`

## Download and build AWS SDK Core and S3

- `prepare-aws-sdk.sh` : will download and install into `./bin`

## build `hello` lambda

```bash
./build.sh
```

## build `encoder` lambda

```bash
./build-encoder.sh
```

## deploy lambda function

- `cd aws/cli`
- `./create-role.sh`
- `./create-lambda-hello.sh`
- `./create-lambda-encoder.sh`

## Incoke lambda function

- `cd aws/cli`
- `./invoke-hello.sh` and check `output.txt`
- `./invoke-encoder.sh` will ask you `BUCKET_NAME` and `KEY`. result will also be stored in `output.txt`

## Reference

  - https://aws.amazon.com/blogs/compute/introducing-the-c-lambda-runtime/
