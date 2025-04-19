#!/bin/bash

echo "Testing Deno service benchmark endpoint..."
curl -s http://localhost:8000/benchmark | jq .

echo -e "\nTesting Node.js service benchmark endpoint..."
curl -s http://localhost:8001/benchmark | jq .

echo -e "\nTesting NestJS service benchmark endpoint..."
curl -s http://localhost:8002/benchmark | jq .

echo -e "\nTesting Deno service via UI proxy..."
curl -s http://localhost:3000/api/deno/benchmark | jq .

echo -e "\nTesting Node.js service via UI proxy..."
curl -s http://localhost:3000/api/node/benchmark | jq .

echo -e "\nTesting NestJS service via UI proxy..."
curl -s http://localhost:3000/api/nest/benchmark | jq . 