import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BenchmarkData {
  latency: number;
  memoryUsage: number;
  throughput: number;
  timestamp: number;
}

export interface ServiceConfig {
  id: 'deno' | 'node' | 'nest';
  name: string;
  url: string;
  color: string;
  enabled: boolean;
}

export const serviceConfigs: ServiceConfig[] = [
  {
    id: 'deno',
    name: 'Deno Service',
    url: 'http://localhost:8000/benchmark',
    color: '#1976d2',
    enabled: true,
  },
  {
    id: 'node',
    name: 'Node.js Service',
    url: 'http://localhost:8001/benchmark',
    color: '#388e3c',
    enabled: true,
  },
  {
    id: 'nest',
    name: 'NestJS Service',
    url: 'http://localhost:8002/benchmark',
    color: '#e53935',
    enabled: true,
  },
];
