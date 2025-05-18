# Smiles For Speech

An autism screening application for Ghana with Firebase integration.

## Prerequisites

- Node.js v12 or higher (compatible with v12.22.12)
- npm or yarn
- Firebase account with Firestore database

## Project Structure

- `/src` - Frontend React components and application code
- `/public` - Static assets
- `/backend` - Express.js backend API server
- `/dist` - Production build (created when running `npm run build`)

## Firebase Database Structure

The application uses Firebase Firestore with the following collections:

1. **users**: Stores user account information
   - `uid`: Firebase Auth user ID
   - `name`: User's full name
   - `email`: User's email address
   - `role`: User role (e.g., "parent")
   - `emailVerified`: Boolean flag for verification status
   - `profilePicture`: URL to profile picture
   - `createdAt`: Timestamp

2. **childProfiles**: Stores child profiles linked to parent users
   - `parentUid`: Reference to parent's Firebase Auth ID
   - `name`: Child's name
   - `birthDate`: Child's date of birth (YYYY-MM-DD)
   - `gender`: Child's gender (optional)
   - `photoUrl`: URL to child's photo (optional)
   - `createdAt`: Timestamp

3. **screenings**: Stores assessment results
   - `profileId`: Reference to child profile ID
   - `answers`: Object containing question responses
   - `score`: Calculated score from assessment
   - `riskLevel`: Calculated risk level
   - `recommendations`: Array of recommended actions
   - `createdAt`: Timestamp
   - `userId`: Reference to parent's Firebase Auth ID

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

### 3. Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Download your Firebase Admin SDK service account key
5. Save it as `firebase-credentials.json` in the `/backend` directory
6. Create a `.env` file in the `/backend` directory with:
   ```
   FIREBASE_API_KEY=your-api-key
   JWT_SECRET=your-jwt-secret
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
- Kill any processes running on ports 3000 and 5002
- Start the backend server on port 5002
- Start the frontend development server on port 3000

### Method 2: Starting Servers Separately

#### Start the Backend Server

```bash
# Make sure you're in the backend directory
cd backend
PORT=5002 node src/server.js
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
# Find processes using port 5002 (backend)
lsof -i :5002
# Kill the process
kill -9 <PID>

# For frontend (port 3000)
lsof -i :3000
kill -9 <PID>
```

### Firestore Index Error

If you see an error about requiring an index, follow the link in the error message to create the necessary composite index in your Firebase console. This is typically needed for queries that:
- Filter on `profileId`
- Order by `createdAt`

### Path Issues

Always start the backend server from within the `/backend` directory:

```bash
cd /path/to/smiles_for_speech/backend
PORT=5002 node src/server.js
```

### Node.js Compatibility

If you encounter syntax errors with optional chaining (`?.`) or nullish coalescing (`??`), make sure you're using a compatible version of all packages.

## Features

- Firebase Authentication with email verification
- User profiles stored in Firestore
- Password reset functionality
- User authentication middleware
- Autism screening assessment form
- Child profile management
- Screening history and results visualization
