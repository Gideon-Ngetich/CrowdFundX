// controllers/mpesaController.js
const { GroupFunding } = require('../models/GroupFundingSchema.model');

exports.mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    const checkoutRequestId = callbackData.Body.stkCallback.CheckoutRequestID;
    
    // 1. Find the transaction in group members
    const group = await GroupFunding.findOne({
      'member.transactions.transactionId': checkoutRequestId
    });

    if (!group) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 2. Update transaction status
    const resultCode = callbackData.Body.stkCallback.ResultCode;
    const isSuccess = resultCode === 0;

    await GroupFunding.updateOne(
      {
        'member.transactions.transactionId': checkoutRequestId
      },
      {
        $set: {
        //   'member.$[].transactions.$[transaction].status': isSuccess ? 'completed' : 'failed',
          'member.$[].transactions.$[transaction].mpesaCode': isSuccess ? callbackData.Body.stkCallback.CallbackMetadata.Item[1].Value : null
        }
      },
      {
        arrayFilters: [
          { 'transaction.transactionId': checkoutRequestId }
        ]
      }
    );

    // 3. If failed, adjust the totals
    if (!isSuccess) {
      const transaction = group.member
        .flatMap(m => m.transactions)
        .find(t => t.transactionId === checkoutRequestId);

      await GroupFunding.updateOne(
        { _id: group._id },
        {
          $inc: {
            currentAmount: -transaction.amount,
            'member.$[m].totalContributed': -transaction.amount
          }
        },
        {
          arrayFilters: [
            { 'm.transactions.transactionId': checkoutRequestId }
          ]
        }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ error: 'Error processing callback' });
  }
};