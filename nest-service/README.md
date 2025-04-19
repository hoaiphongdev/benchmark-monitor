# NestJS Service

A NestJS HTTP server application that provides benchmark metrics and health information.

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
pnpm start:prod

# Run tests
pnpm test
```

## Environment Variables

- `PORT` - The port to listen on (default: 8002)

## Docker

```bash
# Build the Docker image
docker build -t nest-service .

# Run the Docker container
docker run -p 8002:8002 nest-service
```
