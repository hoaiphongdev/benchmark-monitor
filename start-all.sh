#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists deno; then
  echo "Error: Deno is not installed. Please install Deno first."
  echo "Visit https://deno.land/#installation for installation instructions."
  exit 1
fi

if ! command_exists jq; then
  echo "Warning: jq is not installed. It's recommended for debugging."
  echo "You can install it with: brew install jq"
fi

# Kill any processes on the ports we need
echo "Stopping any existing services on ports 8000, 8001, 8002, 3000..."
for port in 8000 8001 8002 3000; do
  pid=$(lsof -ti :$port)
  if [ ! -z "$pid" ]; then
    kill -9 $pid 2>/dev/null
  fi
done

# Start each service in its own terminal window
echo "Starting all services..."

# Start Deno service
osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/deno-service\" && deno task dev"' &

# Start Node.js service
osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/node-service\" && pnpm dev"' &

# Start NestJS service
osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/nest-service\" && pnpm dev"' &

# Start Monitor UI
osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/monitor-ui\" && pnpm dev"' &

# Wait a bit for services to start
echo "Starting services, please wait..."
sleep 5

# Print service URLs
echo ""
echo "Services:"
echo "✅ Deno Service:     http://localhost:8000/benchmark"
echo "✅ Node.js Service:  http://localhost:8001/benchmark"
echo "✅ NestJS Service:   http://localhost:8002/benchmark"
echo "✅ Monitor UI:       http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop this script (but the services will continue running)"
echo "To stop all services, run: ./stop-all.sh"

# Keep the script running until Ctrl+C
trap "echo 'Script stopped, but services are still running.'" SIGINT
while true; do
  sleep 60
done 