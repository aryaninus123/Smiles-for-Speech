#!/bin/bash

# Get the absolute path to the project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kill any processes running on ports 3000, 3001, and 5001
kill_ports() {
  lsof -i :$1 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
}

echo "Killing any processes using ports 3000, 3001, and 5001..."
kill_ports 3000
kill_ports 3001
kill_ports 5001

# Forcefully kill to ensure ports are free
echo "Ensuring ports are free..."
sleep 1

# Start backend server
echo "Starting backend server..."
cd "$PROJECT_ROOT/backend" && PORT=5001 node src/server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend on port 3000 or fallback to 3001
echo "Starting frontend..."
if lsof -i:3000 > /dev/null; then
  echo "Port 3000 is busy, trying port 3001..."
  cd "$PROJECT_ROOT" && PORT=3001 npm start
else
  cd "$PROJECT_ROOT" && npm start
fi

# When frontend exits, kill backend
kill $BACKEND_PID 