const express = require('express');
const router = express.Router();

router.get('/api/users', (req, res) => {
  res.json([
    {
      id: 'user1'
    },
    {
      id: 'user2'
    }
  ]);
});

router.get('/api/customers', (req, res) => {
  res.json([
    {
      id: 'customer_1'
    },
    {
      id: 'customer_2'
    },
    {
      id: 'customer_3'
    }
  ]);
});

module.exports = router;
