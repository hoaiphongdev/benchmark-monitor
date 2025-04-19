# Service Performance Benchmarking

This monorepo contains a set of microservices and a dashboard UI for benchmarking and comparing the performance of different JavaScript runtimes: Deno, Node.js, and NestJS.

The project allows you to visualize real-time performance metrics including latency, memory usage, CPU usage, and throughput across all three platforms.

## Project Structure

```
.
├── deno-service/    # Deno HTTP server implementation
├── node-service/    # Node.js Fastify implementation
├── nest-service/    # NestJS implementation
└── monitor-ui/      # React dashboard UI
```

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose (for containerized deployment)
- [Node.js](https://nodejs.org/) (v16+)
- [Deno](https://deno.land/) (v1.35+)
- [pnpm](https://pnpm.io/) (v7+)

## Getting Started

### Install Dependencies

```bash
# Install dependencies for Node.js services
cd node-service && pnpm install
cd ../nest-service && pnpm install
cd ../monitor-ui && pnpm install
```

### Development Mode

The repository includes scripts to run all services locally in development mode:

```bash
# Start all services in development mode
./start-all.sh

# Stop all services
./stop-all.sh
```

This will launch:
- Deno service on port 8000
- Node.js service on port 8001
- NestJS service on port 8002
- Monitor UI on port 3000

### Docker Deployment

Each service includes a Dockerfile for containerized deployment. You can build and run them individually or use Docker Compose:

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## Running Tests

Each service includes its own tests:

```bash
# Test Deno service
cd deno-service && deno task test

# Test Node.js service
cd node-service && pnpm test

# Test NestJS service
cd nest-service && pnpm test
```

## Performance Metrics

The benchmarking services measure:

- **Latency**: Time to complete a CPU-intensive operation (ms)
- **Memory Usage**: Heap memory consumption (MB)
- **CPU Usage**: Estimated CPU utilization (%)
- **Throughput**: Operations per second (ops/sec)

## License

MIT 