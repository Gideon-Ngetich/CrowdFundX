// services/mpesaService.js
const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');
const { GroupFunding } = require('../models/GroupFundingSchema.model');
const {MpesaAccountDetails} = require('../models/MpesaAccountDetails.model');

exports.initiateSTKPush = async (email, amount, groupId, phoneNumber) => {
  try {
    // 1. Get group and verify member exists
    const group = await GroupFunding.findOne({
      _id: groupId,
      'member.email': email
    });
    
    if (!group) {
      throw new Error('Group or member not found');
    }

    // 2. Get M-Pesa account details
    const mpesaAccount = await MpesaAccountDetails.findById(group.mpesaAccount);
    if (!mpesaAccount) {
      throw new Error('M-Pesa account not configured for this group');
    }

    // 3. Prepare STK Push request
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = generateSTKPassword(
      mpesaAccount.businessShortCode,
      mpesaAccount.passkey,
      timestamp
    ).toString("base64")
    const getAccessToken = async (consumerKey, consumerSecret) => {
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${auth}` },
        });
        return response.data.access_token;
    };
    

    const transactionRef = `GRP${groupId.toString().slice(-4)}-${email.split('@')[0]}`;
    const accessToken = await getAccessToken(mpesaAccount.consumerKey, mpesaAccount.consumerSecret);

    
    const requestData = {
      BusinessShortCode: mpesaAccount.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: mpesaAccount.businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: `https://ae07-197-232-24-53.ngrok-free.app/api/mpesa/callback`,
      AccountReference: transactionRef,
      TransactionDesc: `Contribution to ${group.groupName}`
    };

    // 4. Make API call to Daraja
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 5. Record pending transaction
    await GroupFunding.updateOne(
      {
        _id: groupId,
        'member.email': email
      },
      {
        $push: {
          'member.$.transactions': {
            transactionId: response.data.CheckoutRequestID,
            amount: amount,
          }
        },
        $inc: {
          currentAmount: amount,
          'member.$.totalContributed': amount
        }
      }
    );

    return {
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      message: 'Payment initiated successfully'
    };
  } catch (error) {
    console.error('STK Push Error:', error);
    throw error;
  }
};

function generateSTKPassword(shortcode, passkey, timestamp) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}