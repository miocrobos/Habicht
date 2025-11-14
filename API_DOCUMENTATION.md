# UniSports API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "UniSports API is running"
}
```

---

## Authentication Endpoints

### Register User

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john.doe@ethz.ch",
  "password": "securePassword123",
  "fullName": "John Doe",
  "university": "eth-zurich"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john.doe@ethz.ch",
    "university": "eth-zurich",
    "fullName": "John Doe",
    "profile": {
      "bio": "",
      "sports": [],
      "achievements": [],
      "rating": 0,
      "ratingCount": 0
    },
    "role": "user"
  }
}
```

### Login

#### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john.doe@ethz.ch",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john.doe@ethz.ch",
    "university": "eth-zurich",
    "fullName": "John Doe",
    "profile": { ... },
    "role": "user"
  }
}
```

---

## University Endpoints

### Get All Universities

#### GET /universities
Get list of all Swiss universities.

**Response:**
```json
[
  {
    "id": "eth-zurich",
    "name": "ETH Zürich",
    "location": "Zürich"
  },
  ...
]
```

---

## Profile Endpoints

### Get User Profile

#### GET /profile/:userId
Get a user's profile information.

**Authentication Required:** Yes

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "fullName": "John Doe",
  "university": "eth-zurich",
  "profile": {
    "bio": "Passionate about sports",
    "sports": [
      {
        "name": "Football",
        "level": "Intermediate"
      }
    ],
    "achievements": [
      {
        "id": 1234567890,
        "title": "University Championship 2023",
        "description": "Won the inter-university football tournament",
        "date": "2023-06-15"
      }
    ],
    "rating": 4.5,
    "ratingCount": 10
  },
  "role": "user",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Update Profile

#### PUT /profile
Update the authenticated user's profile.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "bio": "Updated bio",
  "sports": [
    {
      "name": "Tennis",
      "level": "Advanced"
    }
  ],
  "achievements": [
    {
      "id": 1234567890,
      "title": "Championship Title",
      "description": "Description here",
      "date": "2023-06-15"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

### Rate User

#### POST /profile/:userId/rate
Rate another user (1-5 stars).

**Authentication Required:** Yes

**Request Body:**
```json
{
  "rating": 5
}
```

**Response:**
```json
{
  "message": "Rating submitted successfully",
  "rating": 4.6,
  "ratingCount": 11
}
```

---

## Chat Room Endpoints

### Get All Chat Rooms

#### GET /chatrooms
Get list of all available chat rooms.

**Authentication Required:** Yes

**Response:**
```json
[
  {
    "id": "eth-zurich",
    "name": "ETH Zürich",
    "location": "Zürich",
    "memberCount": 45
  },
  ...
]
```

### Get Chat Room Messages

#### GET /chatrooms/:roomId/messages
Get recent messages from a chat room (last 100).

**Authentication Required:** Yes

**Response:**
```json
[
  {
    "id": "message_uuid",
    "roomId": "eth-zurich",
    "userId": "user_uuid",
    "username": "john_doe",
    "message": "Hello everyone!",
    "timestamp": "2023-06-15T10:30:00.000Z"
  },
  ...
]
```

### Add Room Admin

#### POST /chatrooms/:roomId/admins
Make a user an admin of a chat room. Only existing admins or system admins can use this endpoint.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "userId": "user_uuid"
}
```

**Response:**
```json
{
  "message": "Admin added successfully"
}
```

---

## WebSocket Events

Connect to WebSocket at: `http://localhost:5000`

### Client → Server Events

#### join-room
Join a chat room.
```javascript
socket.emit('join-room', {
  roomId: 'eth-zurich',
  userId: 'user_uuid',
  username: 'john_doe'
});
```

#### send-message
Send a message to a room.
```javascript
socket.emit('send-message', {
  roomId: 'eth-zurich',
  userId: 'user_uuid',
  username: 'john_doe',
  message: 'Hello!',
  timestamp: new Date().toISOString()
});
```

#### leave-room
Leave a chat room.
```javascript
socket.emit('leave-room', {
  roomId: 'eth-zurich',
  username: 'john_doe'
});
```

### Server → Client Events

#### receive-message
Receive a new message.
```javascript
socket.on('receive-message', (data) => {
  // data: { id, roomId, userId, username, message, timestamp }
});
```

#### user-joined
A user joined the room.
```javascript
socket.on('user-joined', (data) => {
  // data: { userId, username, message }
});
```

#### user-left
A user left the room.
```javascript
socket.on('user-left', (data) => {
  // data: { username, message }
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Registration failed"
}
```

---

## Data Models

### User
```javascript
{
  id: string,
  username: string,
  email: string,
  password: string (hashed),
  university: string,
  fullName: string,
  profile: Profile,
  role: 'user' | 'admin',
  createdAt: string (ISO date)
}
```

### Profile
```javascript
{
  bio: string,
  sports: [
    {
      name: string,
      level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'
    }
  ],
  achievements: [
    {
      id: number,
      title: string,
      description: string,
      date: string
    }
  ],
  rating: number (0-5),
  ratingCount: number
}
```

### Chat Room
```javascript
{
  id: string,
  name: string,
  location: string,
  admins: [string], // user IDs
  members: [string] // user IDs
}
```

### Message
```javascript
{
  id: string,
  roomId: string,
  userId: string,
  username: string,
  message: string,
  timestamp: string (ISO date)
}
```
