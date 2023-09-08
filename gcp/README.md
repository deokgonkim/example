# Google Cloud Platform

## Install gcp cli

- Reference : https://cloud.google.com/sdk/docs/install#deb


## Login to project

```bash
gcloud auth login
```

```bash
gcloud config set account dgkim@dgkim.net
```

```bash
gcloud config list
```

## Set Project

```bash
gcloud config set project [project-id]
```

## Example calls

```bash
# list compute ip address list?
gcloud compute addresses list
# list functions list
gcloud functions list
```

