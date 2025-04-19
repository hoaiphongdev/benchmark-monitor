import { assertEquals } from 'https://deno.land/std@0.204.0/assert/mod.ts';

Deno.test('Health endpoint returns ok status', async () => {
  const resp = await fetch('http://localhost:8000/health');
  const data = await resp.json();
  assertEquals(resp.status, 200);
  assertEquals(data.status, 'ok');
  assertEquals(data.service, 'deno-service');
  assertTrue(typeof data.timestamp === 'number');
});

Deno.test('Benchmark endpoint returns metrics', async () => {
  const resp = await fetch('http://localhost:8000/benchmark');
  const data = await resp.json();
  assertEquals(resp.status, 200);
  assertTrue(typeof data.latency === 'number');
  assertTrue(typeof data.memoryUsage === 'number');
  assertTrue(typeof data.throughput === 'number');
  assertTrue(typeof data.timestamp === 'number');
});

function assertTrue(condition: boolean) {
  assertEquals(condition, true);
}
