# TypeSpec Hello World

A sample TypeSpec project demonstrating API design with OpenAPI 3.1 generation, Swagger UI visualization, and mock server capabilities.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## TypeSpec Project Initialization

This project is initialized with TypeSpec and configured to generate OpenAPI 3.1 specifications.

### General `TypeSpec` project initialization

```shell
tsp init
```

### Initial Setup

```bash
# Install dependencies
npm install

# Compile TypeSpec to OpenAPI
npm run compile
```

## Project Structure

```
.
├── main.tsp                    # TypeSpec API definition
├── tspconfig.yaml              # TypeSpec compiler configuration
├── package.json                # Node.js dependencies and scripts
├── server.cjs                  # Swagger UI server
└── tsp-output/
    └── schema/
        └── openapi.yaml        # Generated OpenAPI 3.1 spec
```

## Available Scripts

### Compile TypeSpec

Compile the TypeSpec definition to OpenAPI:

```bash
npm run compile
```

### Watch Mode

Automatically recompile when TypeSpec files change:

```bash
npm run watch
```

### Run Swagger UI Server

Start an Express server serving Swagger UI with your API specification:

```bash
npm start
```

Then open your browser at `http://localhost:3000`

### Run Mock Server

Start a Prism mock server to simulate API responses:

```bash
npm run start-mock
```

The mock server will be available at `http://localhost:4010`

## Installed Dependencies

### TypeSpec Core

- `@typespec/compiler` - TypeSpec compiler (generally installed globally)

- Installed when initializing project. (`tsp init`)
    - `@typespec/http` - HTTP protocol support
    - `@typespec/rest` - REST API conventions
    - `@typespec/openapi` - OpenAPI common definitions
    - `@typespec/openapi3` - OpenAPI 3.x emitter

### Tools

- `express` - Web server framework for Swagger UI
- `swagger-ui-dist` - Swagger UI static assets
- `@stoplight/prism-cli` - Mock server for API testing

## Configuration

### TypeSpec Configuration (tspconfig.yaml)

The project is configured to emit OpenAPI 3.1.0 specifications:

```yaml
emit:
  - "@typespec/openapi3"
options:
  "@typespec/openapi3":
    emitter-output-dir: "{output-dir}/schema"
    openapi-versions:
      - 3.1.0
```

### API Definition (main.tsp)

The main TypeSpec file defines a sample Widget Service with CRUD operations and includes:
- Multiple examples per model
- Mock server URL configuration
- RESTful route definitions
- Error handling models

## Features Demonstrated

- **Type-safe API definitions** - Using TypeSpec's type system
- **Multiple examples** - Using `@example` decorators for better documentation
- **Server URLs** - Using `@server` decorator for mock/dev/prod environments
- **REST conventions** - Standard CRUD operations with proper HTTP methods
- **Error models** - Typed error responses
- **OpenAPI 3.1** - Modern OpenAPI specification generation

## Development Workflow

1. Edit `main.tsp` to define your API
2. Run `npm run compile` to generate OpenAPI spec
3. Run `npm start` to view in Swagger UI
4. Run `npm run start-mock` to test with mock server

For continuous development, run `npm run watch` in one terminal to auto-compile changes.

## Learn More

- [TypeSpec Documentation](https://typespec.io/)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Prism Mock Server](https://stoplight.io/open-source/prism)
