import { Test, TestingModule } from '@nestjs/testing';
import { BenchmarkService } from './benchmark.service';

// Mock performance.now function
jest.mock('perf_hooks', () => ({
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
  }),
  { virtual: true },
);

// Mock Date.now
const mockDate = new Date(2023, 0, 1);
global.Date.now = jest.fn(() => mockDate.getTime());

describe('BenchmarkService', () => {
  let service: BenchmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BenchmarkService],
    }).compile();

    service = module.get<BenchmarkService>(BenchmarkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health info', () => {
      const result = service.getHealth();
      expect(result).toEqual({
        status: 'ok',
        service: 'nest-service',
        timestamp: mockDate.getTime(),
      });
    });
  });

  describe('runBenchmark', () => {
    it('should return benchmark results', () => {
      const result = service.runBenchmark();
      expect(result).toEqual({
        latency: 100, // 100ms
        memoryUsage: 50, // 50MB
        throughput: 10000, // 1,000,000 / (100 / 1000)
        timestamp: mockDate.getTime(),
      });
    });
  });
});
