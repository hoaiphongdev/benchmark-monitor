import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";

interface HealthResponse {
  status: string;
  service: string;
  timestamp: number;
}

interface BenchmarkResponse {
  latency: number;
  memoryUsage: number;
  throughput: number;
  cpuUsage: number;
  timestamp: number;
}

Deno.test("Health endpoint returns ok status", async () => {
  const resp = await fetch("http://localhost:8000/health");
  assertEquals(resp.status, 200);
  
  const data = await resp.json() as HealthResponse;
  assertEquals(data.status, "ok");
  assertEquals(data.service, "deno-service");
  assertEquals(typeof data.timestamp, "number");
});

Deno.test("Benchmark endpoint returns metrics", async () => {
  const resp = await fetch("http://localhost:8000/benchmark");
  assertEquals(resp.status, 200);
  
  const data = await resp.json() as BenchmarkResponse;
  assertEquals(typeof data.latency, "number");
  assertEquals(typeof data.memoryUsage, "number");
  assertEquals(typeof data.throughput, "number");
  assertEquals(typeof data.cpuUsage, "number");
  assertEquals(typeof data.timestamp, "number");
});

function assertTrue(condition: boolean) {
  assertEquals(condition, true);
}
