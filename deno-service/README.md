# Deno Benchmark Service

A high-performance HTTP server built with Deno that provides real-time performance metrics for benchmarking Deno's runtime capabilities.

## Features

- RESTful API endpoints for benchmarking and health checking
- Server-Sent Events (SSE) for real-time metrics streaming
- Measures latency, memory usage, CPU usage, and throughput
- CORS enabled for cross-origin requests

## Endpoints

### GET `/health`

Returns the health status of the service.

**Response:**
```json
{
  "status": "ok",
  "service": "deno-service",
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

Make sure you have [Deno installed](https://deno.land/#installation).

```bash
# Start the server in development mode (with file watching)
deno task dev

# Start the server in production mode
deno task start
```

## Environment Variables

- `PORT` - The port to listen on (default: 8000)

## Docker Deployment

```bash
# Build the Docker image
docker build -t deno-service .

# Run the Docker container
docker run -p 8000:8000 deno-service
```

## Performance Characteristics

The Deno service typically offers:
- Excellent startup time
- Robust security model
- Efficient HTTP request handling
- TypeScript support out of the box
