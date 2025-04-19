import { serve } from 'https://deno.land/std@0.204.0/http/server.ts';

interface BenchmarkResult {
  latency: number;
  memoryUsage: number;
  throughput: number;
  timestamp: number;
  cpuUsage?: number;
}

// Track CPU usage
let prevCpuTime = performance.now();
let prevCpuUsage = 0;

// Function to estimate CPU usage
function getCpuUsagePercent(): number {
  const now = performance.now();
  const elapsed = now - prevCpuTime;
  prevCpuTime = now;
  
  // Run a small CPU-intensive task and measure how long it takes
  const startTime = performance.now();
  let sum = 0;
  for (let i = 0; i < 50000; i++) {
    sum += Math.sqrt(i);
  }
  const endTime = performance.now();
  
  // Calculate relative CPU load based on how long the task took
  const taskTime = endTime - startTime;
  const expectedTime = 5; // ms (calibrated baseline for idle CPU)
  
  // Smooth the value with previous reading
  const currentCpuUsage = Math.min(100, Math.max(0, (taskTime / expectedTime) * 50));
  const smoothedCpuUsage = 0.7 * prevCpuUsage + 0.3 * currentCpuUsage;
  prevCpuUsage = smoothedCpuUsage;
  
  return smoothedCpuUsage;
}

function runBenchmark(): BenchmarkResult {
  const startTime = performance.now();

  // CPU-intensive task simulation
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sqrt(i) * Math.log(i + 1);
  }

  const endTime = performance.now();
  const latency = endTime - startTime;

  // Get memory usage
  const memoryUsage = Deno.memoryUsage().heapUsed / 1024 / 1024; // MB
  
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

// Create SSE stream handler
async function handleSSE(request: Request): Promise<Response> {
  // Set proper headers for SSE with explicit CORS
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, X-Requested-With",
    "X-Accel-Buffering": "no" // Disable Nginx buffering
  });

  // Create a TextEncoder for efficient text encoding
  const encoder = new TextEncoder();
  
  // Create a new ReadableStream with proper error handling
  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE stream started");
      
      // Function to send events
      const sendEvent = () => {
        try {
          const benchmark = runBenchmark();
          const eventString = `data: ${JSON.stringify(benchmark)}\n\n`;
          const eventData = encoder.encode(eventString);
          controller.enqueue(eventData);
        } catch (error) {
          console.error("Error in SSE stream:", error);
        }
      };
      
      // Send initial data
      sendEvent();
      
      // Set up interval to send data every second
      const intervalId = setInterval(sendEvent, 1000);
      
      // Store the interval ID for cleanup
      (controller as any).intervalId = intervalId;
    },
    cancel(controller) {
      console.log("SSE stream cancelled");
      // Clean up the interval when the stream is closed
      if ((controller as any).intervalId) {
        clearInterval((controller as any).intervalId);
      }
    }
  });
  
  // Return the stream as an SSE response with proper headers
  return new Response(stream, { headers });
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Enable CORS with improved headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  if (url.pathname === '/health') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        service: 'deno-service',
        timestamp: Date.now(),
      }),
      { headers },
    );
  }

  if (url.pathname === '/benchmark') {
    const result = runBenchmark();
    return new Response(JSON.stringify(result), { headers });
  }
  
  // Handle SSE stream endpoint
  if (url.pathname === '/benchmark/stream') {
    return handleSSE(req);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
}

const port = parseInt(Deno.env.get('PORT') || '8000');
console.log(`Deno server running on http://localhost:${port}`);

await serve(handler, { port });
