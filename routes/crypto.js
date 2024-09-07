const express = require('express');
const axios = require('axios');
const db = require('../db');
const router = express.Router();

// Cached prices to minimize API requests
let cachedPrices = [];
let lastFetchedTime = 0;

// Fetch prices from CoinGecko API
const fetchCryptoPrices = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: 'bitcoin,ethereum,litecoin,cardano',
      },
    });

    cachedPrices = response.data;
    lastFetchedTime = Date.now();
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
  }
};

// Fetch prices immediately when the server starts
fetchCryptoPrices();

// Set up interval to fetch prices every minute
setInterval(fetchCryptoPrices, 60000);

// Get real-time crypto prices
router.get('/prices', (req, res) => {
  res.json(cachedPrices);
});

// Get transactions for a specific user
router.get('/transactions', (req, res) => {
  const { userId } = req.query;
  const sql = 'SELECT * FROM transactions WHERE user_id = ?';

  db.query(sql, [userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Add a new transaction
router.post('/transactions', (req, res) => {
  const { userId, cryptoName, transactionType, amount } = req.body;
  const sql = 'INSERT INTO transactions (user_id, crypto_name, transaction_type, amount) VALUES (?, ?, ?, ?)';

  db.query(sql, [userId, cryptoName, transactionType, amount], (err, result) => {
    if (err) throw err;
    res.status(201).send('Transaction added');
  });
});

module.exports = router;
