#!/bin/bash

echo "Stopping all running services..."
./stop-all.sh

echo "Building services to apply latest changes..."
pnpm build

echo "Starting services with fixed CORS..."
./start-local.sh

echo "Opening test page..."
sleep 3  # Wait a few seconds for services to start
open -a "Google Chrome" "file://$PWD/check-fetch.html"
echo "Done! Try clicking the 'Test All Services' button in the check-fetch.html page." 