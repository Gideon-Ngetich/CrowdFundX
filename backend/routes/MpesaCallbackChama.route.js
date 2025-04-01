const express = require('express');
const router = express.Router();
const {ChamaContribution} = require('../models/ChamaContribution.model');

router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    
    // Check if this is a valid callback
    if (!callbackData.Body.stkCallback) {
      return res.status(400).send('Invalid callback format');
    }

    const result = callbackData.Body.stkCallback;
    const contribution = await ChamaContribution.findOne({ 
      requestId: result.CheckoutRequestID 
    });

    if (!contribution) {
      return res.status(404).send('Contribution not found');
    }

    if (result.ResultCode === 0) {
      // Successful payment
      const mpesaData = result.CallbackMetadata.Item;
      contribution.status = 'completed';
      contribution.mpesaCode = mpesaData.find(i => i.Name === 'MpesaReceiptNumber').Value;
      contribution.phoneNumber = mpesaData.find(i => i.Name === 'PhoneNumber').Value;
      contribution.amount = mpesaData.find(i => i.Name === 'Amount').Value;
      contribution.transactionDate = mpesaData.find(i => i.Name === 'TransactionDate').Value;
      await contribution.save();
    } else {
      // Failed payment
      contribution.status = 'failed';
      contribution.failureReason = result.ResultDesc;
      await contribution.save();
    }

    res.status(200).send('Callback processed successfully');
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).send('Error processing callback');
  }
});

module.exports = router;