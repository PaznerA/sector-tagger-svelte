#!/bin/bash

# Load environment variables
source .env

# Kill any existing processes on configured ports
for port in $VITE_SERVER_PORT $VITE_WS_PORT $VITE_HMR_PORT; do
  lsof -ti:$port | xargs kill -9 2>/dev/null
done

# Start WS server
bun run ws &
WS_PID=$!

# Start Astro dev server
bun run dev

# Cleanup on exit
trap 'kill $WS_PID' EXIT
