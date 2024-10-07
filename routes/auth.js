const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Ensure this points to your DB connection file
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Input validation
  if (!username || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  // Check if the user already exists
  const checkUserSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserSql, [email], async (err, result) => {
    if (err) {
      console.error('Database error:', err); // Log the error for debugging
      return res.status(500).send('Server error');
    }

    if (result.length > 0) {
      return res.status(400).send('User already exists');
    }

    // Hash the password and insert the user into the database
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

      db.query(sql, [username, email, hashedPassword], (err) => {
        if (err) {
          console.error('Error inserting user:', err); // Log the error for debugging
          return res.status(500).send('Server error');
        }

        // Create a token for the new user
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token to the frontend to redirect to dashboard
        res.status(201).json({ token });
      });
    } catch (error) {
      console.error('Error hashing password:', error); // Log the error for debugging
      res.status(500).send('Error hashing password');
    }
  });
});

// Login an existing user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).send('All fields are required');
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error('Database error:', err); // Log the error for debugging
      return res.status(500).send('Server error');
    }

    if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
      return res.status(401).send('Invalid credentials');
    }

    // Create a token
    const token = jwt.sign({ email: result[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

module.exports = router;


