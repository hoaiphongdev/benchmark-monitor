# Node.js Service

A simple Node.js HTTP server using Fastify that provides benchmark metrics and health information.

## Endpoints

- `/health` - Returns the health status of the service
- `/benchmark` - Runs a benchmark and returns performance metrics

## Running Locally

```bash
# Install dependencies
pnpm install

# Start the server in development mode (with file watching)
pnpm dev

# Build the project
pnpm build

# Start the production server
pnpm start

# Run tests
pnpm test
```

## Environment Variables

- `PORT` - The port to listen on (default: 8001)
- `NODE_ENV` - Set to 'test' when running tests to prevent server startup

## Docker

```bash
# Build the Docker image
docker build -t node-service .

# Run the Docker container
docker run -p 8001:8001 node-service
```
