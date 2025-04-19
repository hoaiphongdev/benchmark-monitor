import Fastify from 'fastify';
import { performance } from 'node:perf_hooks';
import os from 'node:os';

interface BenchmarkResult {
  latency: number;
  memoryUsage: number;
  throughput: number;
  timestamp: number;
  cpuUsage?: number;
}

// Track previous CPU usage for delta calculation
let prevCpuInfo = os.cpus();
const prevCpuTime = process.cpuUsage();

// Function to calculate CPU usage percentage
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

export function runBenchmark(): BenchmarkResult {
  const startTime = performance.now();

  // CPU-intensive task simulation
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
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
  const throughput = 1000000 / (latency / 1000);

  return {
    latency,
    memoryUsage,
    throughput,
    cpuUsage,
    timestamp: Date.now(),
  };
}

async function startServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Better CORS handling
  fastify.addHook('onRequest', (request, reply, done) => {
    // Set CORS headers
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    reply.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      reply.code(204).send();
      return;
    }

    done();
  });

  // Health endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'node-service',
      timestamp: Date.now(),
    };
  });

  // Benchmark endpoint (single request)
  fastify.get('/benchmark', async () => {
    return runBenchmark();
  });

  // Server-Sent Events endpoint for real-time metrics
  fastify.get('/benchmark/stream', async (request, reply) => {
    // Set SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });

    // Disable request timeout
    request.raw.setTimeout(0);

    // Force immediate response flush
    reply.raw.flushHeaders();

    // Send initial data
    const sendEvent = () => {
      try {
        const benchmark = runBenchmark();
        const eventData = `data: ${JSON.stringify(benchmark)}\n\n`;
        reply.raw.write(eventData);
        // Explicitly flush after each write
        if (typeof reply.raw.flush === 'function') {
          reply.raw.flush();
        }
      } catch (error) {
        console.error('Error sending SSE event:', error);
      }
    };

    // Send data immediately
    sendEvent();

    // Set up interval to send data every 1 second
    const interval = setInterval(sendEvent, 1000);

    // Handle client disconnect
    request.raw.on('close', () => {
      clearInterval(interval);
      console.log('SSE client disconnected');
    });

    // Handle any errors on the connection
    reply.raw.on('error', (err) => {
      console.error('SSE stream error:', err);
      clearInterval(interval);
    });

    // Keep connection alive (prevent premature closing)
    reply.raw.on('end', () => {
      clearInterval(interval);
      console.log('SSE stream ended');
    });
  });

  // Get port from environment or use default
  const port = parseInt(process.env.PORT || '8001');

  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Node.js server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
