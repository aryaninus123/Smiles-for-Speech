#!/bin/bash

# This script starts both the backend and frontend servers for the Smiles for Speech app

# Print header
echo "========================================================"
echo "           Smiles for Speech - Startup Script           "
echo "========================================================"

# Kill existing processes on ports 3000 (frontend) and 5002 (backend)
echo "Checking for existing processes..."

# Find and kill process on port 3000 (frontend)
PID_3000=$(lsof -ti:3000)
if [ -n "$PID_3000" ]; then
  echo "Killing process on port 3000 (PID: $PID_3000)"
  kill -9 $PID_3000
else
  echo "No process found on port 3000"
fi

# Find and kill process on port 5002 (backend)
PID_5002=$(lsof -ti:5002)
if [ -n "$PID_5002" ]; then
  echo "Killing process on port 5002 (PID: $PID_5002)"
  kill -9 $PID_5002
else
  echo "No process found on port 5002"
fi

echo "All conflicting processes terminated"
echo "========================================================"

# Start backend server
echo "Starting backend server on port 5002..."
cd backend
PORT=5002 node src/server.js &
BACKEND_PID=$!
cd ..

echo "Backend server started with PID: $BACKEND_PID"
echo "========================================================"

# Wait a bit for backend to initialize
sleep 2

# Start frontend dev server
echo "Starting frontend development server on port 3000..."
npm start &
FRONTEND_PID=$!

echo "Frontend server started with PID: $FRONTEND_PID"
echo "========================================================"
echo ""
echo "Both servers are now running!"
echo "- Backend: http://localhost:5002"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Shutting down servers...'; exit" INT
wait 