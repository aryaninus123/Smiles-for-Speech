# Smiles for Speech API Backend

Backend API service for the Smiles for Speech autism screening app, built for the hackathon.

## Tech Stack

- **Node.js/Express** - API framework
- **Firebase Admin SDK** - Authentication and database
- **Firestore** - NoSQL database
- **JWT** - Authentication tokens

## Project Structure

```
/backend
  /src
    /config      - Configuration files (Firebase, etc.)
    /controllers - Route handlers for each API endpoint
    /middleware  - Custom middleware
    /routes      - API route definitions
    server.js    - Main application file
```

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm
- Firebase project with Firestore enabled

### Installation

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Generate a new private key from Project Settings > Service Accounts
3. Clone this repository
4. Copy `.env.example` to `.env` and update with your Firebase credentials
5. Install dependencies:
```
npm install
```
6. Start the development server:
```
npm run dev
```

## API Endpoints

### Authentication

- Firebase Authentication tokens are required for all protected endpoints
- Send token in the Authorization header as a Bearer token

### Users

- `GET /api/users/me` - Get current user profile
- `POST /api/users/profile` - Create/update user profile
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

### Child Profiles

- `GET /api/profiles` - Get all child profiles for current user
- `GET /api/profiles/:id` - Get a single child profile
- `POST /api/profiles` - Create a new child profile
- `PUT /api/profiles/:id` - Update a child profile
- `DELETE /api/profiles/:id` - Delete a child profile

### Screenings

- `GET /api/screenings/profile/:profileId` - Get all screenings for a child profile
- `GET /api/screenings/:id` - Get a single screening
- `POST /api/screenings` - Create a new screening
- `PUT /api/screenings/:id` - Update screening notes
- `DELETE /api/screenings/:id` - Delete a screening
- `GET /api/screenings/questions` - Get screening questions

### Resources

- `GET /api/resources` - Get all resources or filter by category
- `GET /api/resources/:id` - Get a single resource
- `GET /api/resources/recommendations/:riskLevel` - Get resources by risk level
- `GET /api/resources/local` - Get local resources for Ghana
- `POST /api/resources` - Create a new resource (admin only)
- `PUT /api/resources/:id` - Update a resource (admin only)
- `DELETE /api/resources/:id` - Delete a resource (admin only)

## Data Models

### User
```json
{
  "uid": "firebaseAuthUid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "123-456-7890",
  "address": "Accra, Ghana",
  "role": "parent",
  "createdAt": "2023-05-17T12:00:00Z"
}
```

### Child Profile
```json
{
  "parentUid": "firebaseAuthUid",
  "name": "Child Name",
  "birthDate": "2020-01-01",
  "gender": "male",
  "developmentHistory": "Some development notes",
  "photoUrl": "https://example.com/photo.jpg",
  "createdAt": "2023-05-17T12:00:00Z"
}
```

### Screening
```json
{
  "profileId": "childProfileId",
  "answers": {
    "q1": "Sometimes",
    "q2": "Difficult",
    "q3": "Often"
  },
  "score": 15,
  "riskLevel": "Medium",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "notes": "Additional observations",
  "status": "completed",
  "createdAt": "2023-05-17T12:00:00Z",
  "userId": "firebaseAuthUid"
}
```

### Resource
```json
{
  "title": "Understanding Autism",
  "description": "A guide for parents",
  "category": "Education",
  "url": "https://example.com/resource",
  "imageUrl": "https://example.com/image.jpg",
  "tags": ["Autism", "Education", "Medium", "Ghana"],
  "createdAt": "2023-05-17T12:00:00Z"
}
``` 