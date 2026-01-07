# Go REST API Sample

**This project is generated with @openai/codex**

Simple RESTful API in Go using only the standard library. Data is stored in-memory.

## Variants

- Standard library version (this directory).
- Gin version in `gin-api/`.

## Run

```bash
go run .
```

Gin version:

```bash
cd gin-api
go mod tidy
go run .
```

Server listens on `:8080` by default. Override with `PORT`.

## Endpoints

- `GET /health`
- `GET /items`
- `POST /items`
- `GET /items/{id}`
- `PUT /items/{id}`
- `DELETE /items/{id}`

## Examples

Create an item:

```bash
curl -X POST http://localhost:8080/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","description":"A5 size"}'
```

List items:

```bash
curl http://localhost:8080/items
```

Update an item:

```bash
curl -X PUT http://localhost:8080/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","description":"Updated"}'
```

Delete an item:

```bash
curl -X DELETE http://localhost:8080/items/1
```
