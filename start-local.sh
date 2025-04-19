#!/bin/bash

# Kill any processes on the ports we need
echo "Stopping any existing services on ports 8000, 8001, 8002, 3000..."
for port in 8000 8001 8002 3000; do
  pid=$(lsof -ti :$port)
  if [ ! -z "$pid" ]; then
    kill -9 $pid 2>/dev/null
  fi
done

# Start services in terminal tabs
echo "Starting all services in new terminal tabs..."

# Start one service per tab in iTerm2
if command -v osascript >/dev/null 2>&1; then
  # Start Deno service
  osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'/deno-service\" && deno task dev"'

  # Start Node service
  osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'/node-service\" && pnpm dev"'

  # Start Nest service
  osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'/nest-service\" && pnpm dev"'

  # Start the UI
  osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'/monitor-ui\" && pnpm dev"'
else
  echo "Cannot open terminal windows. Please start services manually:"
  echo "1. cd deno-service && deno task dev"
  echo "2. cd node-service && pnpm dev"
  echo "3. cd nest-service && pnpm dev"
  echo "4. cd monitor-ui && pnpm dev"
fi

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

# Open the test page
if command -v open >/dev/null 2>&1; then
  # Open the CORS test page
  echo "Opening CORS test page..."
  open "http://localhost:3000"
  open "file://$PWD/test-cors.html"
else
  echo "Please open the CORS test page manually:"
  echo "file://$PWD/test-cors.html"
  echo "And your application at:"
  echo "http://localhost:3000"
fi

# Print URLs
echo ""
echo "✅ Services are starting:"
echo "- Deno:    http://localhost:8000/benchmark"
echo "- Node.js: http://localhost:8001/benchmark"
echo "- NestJS:  http://localhost:8002/benchmark"
echo "- UI:      http://localhost:3000"
echo ""
echo "✅ CORS Test: file://$PWD/test-cors.html" 