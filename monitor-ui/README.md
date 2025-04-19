# Performance Monitor UI

A modern React dashboard for real-time visualization of performance metrics across Deno, Node.js, and NestJS services.

## Features

- Real-time metrics visualization with line charts
- Support for streaming data through Server-Sent Events (SSE)
- Toggle individual services for comparison
- Responsive design for all device sizes
- Dark mode interface for reduced eye strain

## Tech Stack

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tooling
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Recharts** - Charting library
- **Server-Sent Events** - Real-time streaming

## Dashboard Layout

- **Service Selection** - Toggle which services to monitor
- **Metric Selection** - Choose between latency, memory usage, CPU usage, and throughput
- **Real-time Charts** - Line graphs showing performance over time
- **Live Metrics** - Current values for each service
- **Streaming Controls** - Start/stop real-time data flow

## Visualized Metrics

- **Latency** - Time to complete operations (ms)
- **Memory Usage** - Heap memory consumption (MB)
- **CPU Usage** - CPU utilization percentage (%)
- **Throughput** - Operations per second (ops/sec)

## Running Locally

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for backend services (optional, defaults to relative URLs)

## Docker Deployment

```bash
# Build the Docker image
docker build -t monitor-ui .

# Run the Docker container
docker run -p 3000:80 monitor-ui
```

## Usage

1. Start the backend services (Deno, Node.js, NestJS)
2. Launch the UI application
3. Use the toggle buttons to select services and metrics to compare
4. Click "Start Streaming" for real-time updates
5. Analyze the performance differences across services

## Note

The UI requires at least one backend service to be running to display meaningful data.
