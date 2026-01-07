# Gin REST API Sample

Gin-based RESTful API with in-memory storage.

## Run

```bash
cd gin-api
go mod tidy
go run .
```

The server listens on `:8080` by default. Override with `PORT`.

## Endpoints

- `GET /health`
- `GET /items`
- `POST /items`
- `GET /items/{id}`
- `PUT /items/{id}`
- `DELETE /items/{id}`
