# Deno Service

A simple Deno HTTP server that provides benchmark metrics and health information.

## Endpoints

- `/health` - Returns the health status of the service
- `/benchmark` - Runs a benchmark and returns performance metrics

## Running Locally

Make sure you have Deno installed (https://deno.land/#installation).

```bash
# Start the server in development mode (with file watching)
deno task dev

# Start the server
deno task start

# Run tests
deno task test
```

## Environment Variables

- `PORT` - The port to listen on (default: 8000)

## Docker

```bash
# Build the Docker image
docker build -t deno-service .

# Run the Docker container
docker run -p 8000:8000 deno-service
```
