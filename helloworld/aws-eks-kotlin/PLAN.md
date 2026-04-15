# Implementation Plan

## Summary

Build the smallest practical backend API server for frontend use with Kotlin + Spring Boot and deploy it to an existing AWS EKS cluster using an AWS ALB-backed ingress.

## Implementation changes

- Create a single Spring Boot application module using Gradle Kotlin DSL.
- Expose:
  - `GET /health`
  - `GET /api/hello`
- Package the app as a Docker image that runs on port `8080`.
- Add Kubernetes manifests for:
  - `Deployment` with 1 replica,
  - `Service` as `ClusterIP` on `80 -> 8080`,
  - `Ingress` using `ingressClassName: alb` and AWS ALB annotations.
- Add tests for both HTTP endpoints.

## Public interfaces

- `GET /health` returns `200` with `{ "status": "ok" }`.
- `GET /api/hello` returns `200` with `{ "message": "Hello from Kotlin Spring Boot on EKS" }`.

## Validation

- `./gradlew test`
- `./gradlew bootRun`
- `curl http://localhost:8080/health`
- `curl http://localhost:8080/api/hello`
- `docker build -t aws-eks-backend:latest .`
- Apply manifests to an existing EKS cluster after replacing the placeholder image reference.

## Assumptions

- EKS cluster creation is out of scope.
- AWS Load Balancer Controller is already installed in the cluster.
- No fixed host, TLS, authentication, database, or persistence is required.
- The backend remains intentionally minimal and frontend-oriented.
