#!/bin/bash

# Kill any processes running on ports 3000, 3001, and 5001
kill_ports() {
  lsof -i :$1 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
}

echo "Killing any processes using ports 3000, 3001, and 5001..."
kill_ports 3000
kill_ports 3001
kill_ports 5001

# Start backend server
echo "Starting backend server..."
cd backend && PORT=5001 node src/server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "Starting frontend..."
cd $(dirname $0) && npm start

# When frontend exits, kill backend
kill $BACKEND_PID 