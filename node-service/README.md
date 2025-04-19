# Node.js Benchmark Service

A high-performance HTTP server built with Node.js and Express.js that provides real-time performance metrics for benchmarking Node.js runtime capabilities.

## Features

- RESTful API endpoints for benchmarking and health checking
- Server-Sent Events (SSE) for real-time metrics streaming
- Measures latency, memory usage, CPU usage, and throughput
- Built with Express.js for optimal performance
- Written in TypeScript with full type safety

## Endpoints

### GET `/health`

Returns the health status of the service.

**Response:**
```json
{
  "status": "ok",
  "service": "node-service",
  "timestamp": 1678901234567
}
```

### GET `/benchmark`

Runs a CPU-intensive benchmark and returns performance metrics.

**Response:**
```json
{
  "latency": 123.45,        // milliseconds
  "memoryUsage": 45.67,     // MB
  "throughput": 8901.23,    // operations per second
  "cpuUsage": 56.78,        // percentage (0-100)
  "timestamp": 1678901234567
}
```

### GET `/benchmark/stream`

Provides a Server-Sent Events (SSE) stream with real-time benchmark metrics sent every second.

**Response format:**
```
data: {"latency":123.45,"memoryUsage":45.67,"throughput":8901.23,"cpuUsage":56.78,"timestamp":1678901234567}

data: {"latency":124.56,"memoryUsage":45.78,"throughput":8912.34,"cpuUsage":57.89,"timestamp":1678901235567}

...
```

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

## Docker Deployment

```bash
# Build the Docker image
docker build -t node-service .

# Run the Docker container
docker run -p 8001:8001 node-service
```

## Technical Implementation

This service is built with:

- **Express.js** - Fast, unopinionated, minimalist web framework
- **TypeScript** - For type safety and modern JavaScript features
- **Server-Sent Events (SSE)** - For real-time data streaming
- **Node.js core modules** - For CPU and memory metrics

## Performance Characteristics

The Node.js service with Express.js typically offers:
- Fast startup time
- Excellent HTTP request throughput
- Low memory footprint
- Mature ecosystem with extensive library support
