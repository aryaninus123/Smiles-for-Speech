# Smiles For Speech

An autism screening application for Ghana with Firebase integration.

## Prerequisites

- Node.js v12 or higher (compatible with v12.22.12)
- npm or yarn

## Project Structure

- `/src` - Frontend React components and application code
- `/public` - Static assets
- `/backend` - Express.js backend API server
- `/dist` - Production build (created when running `npm run build`)

## Setup & Installation

### 1. Install Frontend Dependencies

```bash
# In the project root directory
npm install
```

### 2. Install Backend Dependencies

```bash
# Navigate to the backend directory
cd backend
npm install
```

## Running the Application

### Method 1: Using the Start Script (Recommended)

We've created a convenient script that starts both the backend and frontend servers:

```bash
# From the project root
chmod +x start.sh  # Make the script executable (first time only)
./start.sh
```

This script will:
- Kill any processes running on ports 3000, 3001, and 5001
- Start the backend server on port 5001
- Start the frontend development server on port 3000

### Method 2: Starting Servers Separately

#### Start the Backend Server

```bash
# Make sure you're in the backend directory
cd backend
PORT=5001 node src/server.js
```

#### Start the Frontend Development Server

```bash
# In a new terminal, from the project root
npm start
```

## Build for Production

```bash
npm run build
```

## Troubleshooting

### Port Conflicts

If you see errors like `Error: listen EADDRINUSE: address already in use`, kill the processes using those ports:

```bash
# Find processes using port 5001 (backend)
lsof -i :5001
# Kill the process
kill -9 <PID>

# For frontend (port 3000)
lsof -i :3000
kill -9 <PID>
```

### Path Issues

Always start the backend server from within the `/backend` directory:

```bash
cd /path/to/smiles_for_speech/backend
PORT=5001 node src/server.js
```

### Node.js Compatibility

If you encounter syntax errors with optional chaining (`?.`) or nullish coalescing (`??`), make sure you're using a compatible version of all packages.

## Features

- Firebase Authentication with email verification
- User profiles stored in Firestore
- Password reset functionality
- User authentication middleware
- Autism screening assessment form
