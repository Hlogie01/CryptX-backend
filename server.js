require('dotenv').config();  // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const db = require('./db');  // Ensure you have a database connection
require('./passport');  // Load Passport.js configuration

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true // Allow credentials if needed
}));
app.use(bodyParser.json());
app.use(session({ 
  secret: process.env.JWT_SECRET, 
  resave: false, 
  saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// Health check route (optional)
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

