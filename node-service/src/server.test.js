import { describe, it, expect, jest } from '@jest/globals';
import { runBenchmark } from './server.js';

// Mock the performance API
global.performance = {
  now: jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(100),
};

// Mock the process.memoryUsage function
process.memoryUsage = jest.fn().mockReturnValue({
  heapUsed: 50 * 1024 * 1024, // 50MB
});

// Mock Date.now for consistent timestamp
Date.now = jest.fn().mockReturnValue(1635000000000);

// Mock os module
jest.mock('node:os', () => ({
  cpus: jest.fn().mockReturnValue([
    {
      times: {
        user: 100,
        nice: 0,
        sys: 50,
        idle: 200,
        irq: 0,
      },
    },
  ]),
}));

describe('runBenchmark', () => {
  it('returns benchmark metrics', async () => {
    const result = await runBenchmark();

    expect(result).toHaveProperty('latency');
    expect(result).toHaveProperty('memoryUsage');
    expect(result).toHaveProperty('throughput');
    expect(result).toHaveProperty('cpuUsage');
    expect(result).toHaveProperty('timestamp');

    expect(typeof result.latency).toBe('number');
    expect(typeof result.memoryUsage).toBe('number');
    expect(typeof result.throughput).toBe('number');
    expect(typeof result.cpuUsage).toBe('number');
    expect(typeof result.timestamp).toBe('number');
  });
});
