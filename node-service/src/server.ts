import express, { Request, Response } from 'express';
import cors from 'cors';
import { performance } from 'node:perf_hooks';
import os from 'node:os';

// Constants
const DEFAULT_PORT = 8001;
const BENCHMARK_ITERATIONS = 1000000;
const UPDATE_INTERVAL_MS = 1000;

interface BenchmarkResult {
  latency: number;
  memoryUsage: number;
  throughput: number;
  timestamp: number;
  cpuUsage?: number;
}

// Track previous CPU usage for delta calculation
let prevCpuInfo = os.cpus();

/**
 * Calculate CPU usage percentage based on idle time
 */
function getCpuUsagePercent(): number {
  // Calculate system CPU usage
  const currentCpuInfo = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (let i = 0; i < currentCpuInfo.length; i++) {
    const prevCpu = prevCpuInfo[i];
    const currentCpu = currentCpuInfo[i];

    // Calculate difference
    for (const type in currentCpu.times) {
      const time =
        currentCpu.times[type as keyof typeof currentCpu.times] -
        prevCpu.times[type as keyof typeof prevCpu.times];
      totalTick += time;
      if (type === 'idle') {
        totalIdle += time;
      }
    }
  }

  // Update previous value
  prevCpuInfo = currentCpuInfo;

  // Calculate CPU usage percentage (100% - idle%)
  return Math.min(100, Math.max(0, 100 - (totalIdle / totalTick) * 100));
}

/**
 * Run benchmark and return performance metrics
 */
export function runBenchmark(): BenchmarkResult {
  const startTime = performance.now();

  // CPU-intensive task simulation
  let sum = 0;
  for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
    sum += Math.sqrt(i) * Math.log(i + 1);
  }
  console.log('🚀 ~ runBenchmark ~ sum:', sum);

  const endTime = performance.now();
  const latency = endTime - startTime;

  // Get memory usage
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB

  // Get CPU usage
  const cpuUsage = getCpuUsagePercent();

  // Calculate simulated throughput (operations per second)
  const throughput = BENCHMARK_ITERATIONS / (latency / 1000);

  return {
    latency,
    memoryUsage,
    throughput,
    cpuUsage,
    timestamp: Date.now(),
  };
}

/**
 * Configure and start the Express server
 */
async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    }),
  );

  // Health endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'node-service',
      timestamp: Date.now(),
    });
  });

  // Benchmark endpoint (single request)
  app.get('/benchmark', (_req: Request, res: Response) => {
    res.json(runBenchmark());
  });

  // Server-Sent Events endpoint for real-time metrics
  app.get('/benchmark/stream', (req: Request, res: Response) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

    // Disable request timeout
    req.socket.setTimeout(0);

    // Send initial data
    const sendEvent = () => {
      try {
        const benchmark = runBenchmark();
        const eventData = `data: ${JSON.stringify(benchmark)}\n\n`;
        res.write(eventData);
        // Express doesn't have flush method like Fastify, we rely on standard HTTP behavior
      } catch (error) {
        console.error('Error sending SSE event:', error);
      }
    };

    // Send data immediately
    sendEvent();

    // Set up interval to send data every 1 second
    const interval = setInterval(sendEvent, UPDATE_INTERVAL_MS);

    // Handle client disconnect
    req.on('close', () => {
      clearInterval(interval);
      console.log('SSE client disconnected');
    });
  });

  // Get port from environment or use default
  const port = parseInt(process.env.PORT || DEFAULT_PORT.toString());

  try {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Node.js server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
