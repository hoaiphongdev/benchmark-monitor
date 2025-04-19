import { Module } from '@nestjs/common';
import { BenchmarkController } from './benchmark/benchmark.controller';
import { BenchmarkService } from './benchmark/benchmark.service';

@Module({
  imports: [],
  controllers: [BenchmarkController],
  providers: [BenchmarkService],
})
export class AppModule {}
