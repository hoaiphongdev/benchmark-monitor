import { jest } from '@jest/globals';
import { runBenchmark } from './server';

// Mock the performance.now function
jest.mock('node:perf_hooks', () => ({
  performance: {
    now: jest
      .fn()
      .mockReturnValueOnce(0) // First call returns 0
      .mockReturnValueOnce(100), // Second call returns 100 (simulating 100ms elapsed)
  },
}));

// Mock process.memoryUsage
jest.mock(
  'process',
  () => ({
    memoryUsage: jest.fn().mockReturnValue({ heapUsed: 50 * 1024 * 1024 }), // 50MB
    env: {},
    exit: jest.fn(),
  }),
  { virtual: true },
);

// Mock Date.now
const mockDate = new Date(2023, 0, 1);
global.Date.now = jest.fn(() => mockDate.getTime());

describe('Benchmark Function', () => {
  test('returns expected metrics', () => {
    const result = runBenchmark();

    expect(result).toEqual({
      latency: 100, // 100ms
      memoryUsage: 50, // 50MB
      throughput: 10000, // 1,000,000 / (100 / 1000)
      timestamp: mockDate.getTime(),
    });
  });
});
