const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (replace with database in production)
const users = [];
const chatRooms = [];
const messages = [];

// Swiss Universities/Hochschulen
const swissUniversities = [
  { id: 'eth-zurich', name: 'ETH Zürich', location: 'Zürich' },
  { id: 'epfl', name: 'EPFL', location: 'Lausanne' },
  { id: 'uzh', name: 'University of Zürich', location: 'Zürich' },
  { id: 'unige', name: 'University of Geneva', location: 'Geneva' },
  { id: 'unibas', name: 'University of Basel', location: 'Basel' },
  { id: 'unibe', name: 'University of Bern', location: 'Bern' },
  { id: 'unil', name: 'University of Lausanne', location: 'Lausanne' },
  { id: 'unisg', name: 'University of St. Gallen', location: 'St. Gallen' },
  { id: 'unifr', name: 'University of Fribourg', location: 'Fribourg' },
  { id: 'unilu', name: 'University of Lucerne', location: 'Lucerne' }
];

// Initialize chat rooms for each university
swissUniversities.forEach(uni => {
  chatRooms.push({
    id: uni.id,
    name: uni.name,
    location: uni.location,
    admins: [],
    members: []
  });
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'unisports-secret-key-change-in-production';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UniSports API is running' });
});

// Get all universities
app.get('/api/universities', (req, res) => {
  res.json(swissUniversities);
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, university, fullName } = req.body;

    // Validate input
    if (!username || !email || !password || !university) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      university,
      fullName: fullName || username,
      profile: {
        bio: '',
        sports: [],
        achievements: [],
        rating: 0,
        ratingCount: 0
      },
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(user);

    // Add user to university chat room
    const room = chatRooms.find(r => r.id === university);
    if (room) {
      room.members.push(user.id);
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        university: user.university,
        fullName: user.fullName,
        profile: user.profile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        university: user.university,
        fullName: user.fullName,
        profile: user.profile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/api/profile/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    university: user.university,
    profile: user.profile,
    role: user.role,
    createdAt: user.createdAt
  });
});

// Update user profile
app.put('/api/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { bio, sports, achievements } = req.body;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (bio !== undefined) user.profile.bio = bio;
  if (sports !== undefined) user.profile.sports = sports;
  if (achievements !== undefined) user.profile.achievements = achievements;

  res.json({
    message: 'Profile updated successfully',
    profile: user.profile
  });
});

// Rate a user
app.post('/api/profile/:userId/rate', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Calculate new average rating
  const totalRating = (user.profile.rating * user.profile.ratingCount) + rating;
  user.profile.ratingCount += 1;
  user.profile.rating = totalRating / user.profile.ratingCount;

  res.json({
    message: 'Rating submitted successfully',
    rating: user.profile.rating,
    ratingCount: user.profile.ratingCount
  });
});

// Get chat rooms
app.get('/api/chatrooms', authenticateToken, (req, res) => {
  res.json(chatRooms.map(room => ({
    id: room.id,
    name: room.name,
    location: room.location,
    memberCount: room.members.length
  })));
});

// Get messages for a chat room
app.get('/api/chatrooms/:roomId/messages', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const roomMessages = messages
    .filter(m => m.roomId === roomId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-100); // Return last 100 messages

  res.json(roomMessages);
});

// Make user admin of a chat room
app.post('/api/chatrooms/:roomId/admins', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  // Only existing admins or system can make new admins
  const room = chatRooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Chat room not found' });
  }

  const requestingUser = users.find(u => u.id === req.user.id);
  if (!room.admins.includes(req.user.id) && requestingUser.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can assign admin roles' });
  }

  if (!room.admins.includes(userId)) {
    room.admins.push(userId);
  }

  res.json({ message: 'Admin added successfully' });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', ({ roomId, userId, username }) => {
    socket.join(roomId);
    console.log(`User ${username} joined room ${roomId}`);

    io.to(roomId).emit('user-joined', {
      userId,
      username,
      message: `${username} joined the chat`
    });
  });

  socket.on('send-message', ({ roomId, userId, username, message, timestamp }) => {
    const messageData = {
      id: uuidv4(),
      roomId,
      userId,
      username,
      message,
      timestamp: timestamp || new Date().toISOString()
    };

    messages.push(messageData);
    io.to(roomId).emit('receive-message', messageData);
  });

  socket.on('leave-room', ({ roomId, username }) => {
    socket.leave(roomId);
    io.to(roomId).emit('user-left', {
      username,
      message: `${username} left the chat`
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`UniSports server running on port ${PORT}`);
});
