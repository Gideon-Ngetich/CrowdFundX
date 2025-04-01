// routes/mpesaRoutes.js
const express = require('express');
const router = express.Router();
const mpesaService = require('../controllers/GroupFundingController');
const mpesaController = require('../controllers/GroupFundingCallback')

// Initiate STK Push
router.post('/groupfundcontribution', async (req, res) => {
  try {
    const { email, amount, groupId, phoneNumber } = req.body;
    
    const result = await mpesaService.initiateSTKPush(
      email,
      amount,
      groupId,
      phoneNumber
    );
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Callback URL
router.post('/callback', mpesaController.mpesaCallback);

module.exports = router;