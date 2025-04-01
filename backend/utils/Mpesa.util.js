const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

// Generate access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.data.access_token;
};

// Generate timestamp (YYYYMMDDHHmmss)
const getTimestamp = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('');
};

// Generate Lipa Na M-Pesa password
const generatePassword = (shortcode, passkey, timestamp) => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
};

module.exports = { getAccessToken, getTimestamp, generatePassword };