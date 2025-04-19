import { Controller, Get, Sse } from '@nestjs/common';
import { BenchmarkService, BenchmarkResult } from './benchmark.service';
import { Observable, interval, map } from 'rxjs';

@Controller()
export class BenchmarkController {
  constructor(private readonly benchmarkService: BenchmarkService) {}

  @Get('health')
  getHealth() {
    return this.benchmarkService.getHealth();
  }

  @Get('benchmark')
  getBenchmark(): BenchmarkResult {
    return this.benchmarkService.runBenchmark();
  }

  @Sse('benchmark/stream')
  streamBenchmark(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map(() => {
        const data = this.benchmarkService.runBenchmark();
        return { data: JSON.stringify(data) } as MessageEvent;
      }),
    );
  }
}
