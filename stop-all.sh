#!/bin/bash

echo "Stopping all services..."

# Find and kill processes on the service ports
for port in 8000 8001 8002 3000; do
  pid=$(lsof -ti :$port)
  if [ ! -z "$pid" ]; then
    echo "Stopping service on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
  else
    echo "No service running on port $port"
  fi
done

echo "All services stopped." 