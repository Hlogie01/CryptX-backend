const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const db = require('../db');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';

  db.query(sql, [email, hashedPassword], (err, result) => {
    if (err) throw err;
    res.status(201).send('User registered');
  });
});

// Login an existing user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, result) => {
    if (err) throw err;

    if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ email: result[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
  }
);

module.exports = router;
