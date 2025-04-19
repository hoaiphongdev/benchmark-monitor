interface BenchmarkResult {
  latency: number;
  memoryUsage: number;
  throughput: number;
  timestamp: number;
  cpuUsage: number;
}

interface StreamController extends ReadableStreamDefaultController {
  intervalId?: number;
}

interface HealthResponse {
  status: string;
  service: string;
  timestamp: number;
}

interface ErrorResponse {
  error: string;
}

let prevCpuUsage = 0;

function getCpuUsagePercent(): number {
  const startTime = performance.now();
  let sum = 0;
  for (let i = 0; i < 50000; i++) {
    sum += Math.sqrt(i);
  }
  const endTime = performance.now();
  
  const taskTime = endTime - startTime;
  const expectedTime = 5;
  
  const currentCpuUsage = Math.min(100, Math.max(0, (taskTime / expectedTime) * 50));
  const smoothedCpuUsage = 0.7 * prevCpuUsage + 0.3 * currentCpuUsage;
  prevCpuUsage = smoothedCpuUsage;
  
  return smoothedCpuUsage;
}

function runBenchmark(): BenchmarkResult {
  const startTime = performance.now();

  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sqrt(i) * Math.log(i + 1);
  }

  const endTime = performance.now();
  const latency = endTime - startTime;

  const memoryUsage = Deno.memoryUsage().heapUsed / 1024 / 1024; // MB
  
  const cpuUsage = getCpuUsagePercent();

  const throughput = 1000000 / (latency / 1000);

  return {
    latency,
    memoryUsage,
    throughput,
    cpuUsage,
    timestamp: Date.now(),
  };
}

function handleSSE(_: Request): Response {
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, X-Requested-With",
    "X-Accel-Buffering": "no"
  });

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller: StreamController) {
      console.log("SSE stream started");
      
      const sendEvent = (): void => {
        try {
          const benchmark = runBenchmark();
          const eventString = `data: ${JSON.stringify(benchmark)}\n\n`;
          const eventData = encoder.encode(eventString);
          controller.enqueue(eventData);
        } catch (error) {
          console.error("Error in SSE stream:", error);
        }
      };
      
      sendEvent();
      
      controller.intervalId = setInterval(sendEvent, 1000);
    },
    cancel(controller: StreamController) {
      console.log("SSE stream cancelled");
      if (controller.intervalId) {
        clearInterval(controller.intervalId);
      }
    }
  });
  
  return new Response(stream, { headers });
}

function createCorsHeaders(): Headers {
  return new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  });
}

function handler(req: Request): Response {
  const url = new URL(req.url);
  const headers = createCorsHeaders();

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  if (url.pathname === '/health') {
    const healthResponse: HealthResponse = {
      status: 'ok',
      service: 'deno-service',
      timestamp: Date.now(),
    };
    return new Response(JSON.stringify(healthResponse), { headers });
  }

  if (url.pathname === '/benchmark') {
    const result = runBenchmark();
    return new Response(JSON.stringify(result), { headers });
  }
  
  if (url.pathname === '/benchmark/stream') {
    return handleSSE(req);
  }

  const errorResponse: ErrorResponse = { error: 'Not found' };
  return new Response(JSON.stringify(errorResponse), { status: 404, headers });
}

const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Deno server running on http://localhost:${port}`);

const server = Deno.serve({ port }, handler);

// Uncomment below line if you need to wait for the server to finish
await server.finished;
