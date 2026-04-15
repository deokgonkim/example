# AWS EKS Backend API

Minimal Kotlin + Spring Boot backend API for a frontend, packaged for Docker and deployed to an existing AWS EKS cluster with AWS ALB Ingress.

## Stack

- Kotlin
- Spring Boot
- Gradle Kotlin DSL
- Docker
- Kubernetes
- AWS EKS
- AWS Load Balancer Controller / ALB Ingress

## API

### `GET /health`

Returns service health.

Example response:

```json
{
  "status": "ok"
}
```

### `GET /api/hello`

Returns a simple frontend-facing message.

Example response:

```json
{
  "message": "Hello from Kotlin Spring Boot on EKS"
}
```

## Local development

Generate the Gradle wrapper if needed:

```bash
gradle wrapper
```

Run tests:

```bash
./gradlew test
```

Run the app locally:

```bash
./gradlew bootRun
```

Then call:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/hello
```

## Docker

Build the image:

```bash
docker build -t aws-eks-backend:latest .
```

Run the container:

```bash
docker run --rm -p 8080:8080 aws-eks-backend:latest
```

## Kubernetes on EKS

This repo assumes:

- an existing EKS cluster,
- AWS Load Balancer Controller is already installed,
- you will replace the placeholder image in `k8s/deployment.yaml`.

Apply manifests:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

The service listens on port `80` inside the cluster and forwards to container port `8080`. The ingress creates an internet-facing ALB and routes `/` to the backend service.

## Project structure

```text
.
├── build.gradle.kts
├── Dockerfile
├── k8s/
│   ├── deployment.yaml
│   ├── ingress.yaml
│   └── service.yaml
├── settings.gradle.kts
└── src/
```
