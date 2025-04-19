import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';
import * as os from 'os';

export interface BenchmarkResult {
  latency: number;
  memoryUsage: number;
  throughput: number;
  timestamp: number;
  cpuUsage?: number;
}

// Track CPU usage
let prevCpuInfo = os.cpus();
let lastCpuUsage = 0;

@Injectable()
export class BenchmarkService {
  getHealth() {
    return {
      status: 'ok',
      service: 'nest-service',
      timestamp: Date.now(),
    };
  }

  // Function to estimate CPU usage
  getCpuUsagePercent(): number {
    // Get current CPU info
    const currentCpuInfo = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    // Calculate CPU usage across all cores
    for (let i = 0; i < currentCpuInfo.length; i++) {
      const prevCpu = prevCpuInfo[i];
      const currentCpu = currentCpuInfo[i];

      // Calculate difference for each type of CPU time
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

    // Update previous value for next calculation
    prevCpuInfo = currentCpuInfo;

    // Calculate CPU usage (0-100%)
    const cpuUsage =
      totalTick > 0
        ? Math.min(100, Math.max(0, 100 - (totalIdle / totalTick) * 100))
        : lastCpuUsage;

    // Apply some smoothing
    const smoothedCpuUsage = 0.7 * lastCpuUsage + 0.3 * cpuUsage;
    lastCpuUsage = smoothedCpuUsage;

    return smoothedCpuUsage;
  }

  runBenchmark(): BenchmarkResult {
    const startTime = performance.now();

    // CPU-intensive task simulation
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i) * Math.log(i + 1);
    }
    console.log('🚀 ~ BenchmarkService ~ runBenchmark ~ sum:', sum);

    const endTime = performance.now();
    const latency = endTime - startTime;

    // Get memory usage
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    // Get CPU usage
    const cpuUsage = this.getCpuUsagePercent();

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
}
