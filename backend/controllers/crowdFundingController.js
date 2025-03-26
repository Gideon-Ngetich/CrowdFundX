const axios = require("axios");
const moment = require("moment");
const { Crowdfunding } = require("../models/crowdFundingSchema.model");
const { CrowdFundingRecords } = require("../models/CrowdFundingRecords.model");
const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });

const router = require('express').Router();
const clients = new Map();


const handleWebSocketUpgrade = (server) => {
    server.on('upgrade', (request, socket, head) => {
      const campaignId = request.url.split('campaignId=')[1];
      
      if (!campaignId) {
        socket.destroy();
        return;
      }
  
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, campaignId);
      });
    });
  
    wss.on('connection', (ws, request, campaignId) => {
      // Store the WebSocket connection with campaignId
      if (!clients.has(campaignId)) {
        clients.set(campaignId, new Set());
      }
      clients.get(campaignId).add(ws);
  
      // Remove client when connection closes
      ws.on('close', () => {
        clients.get(campaignId)?.delete(ws);
        if (clients.get(campaignId)?.size === 0) {
          clients.delete(campaignId);
        }
      });
    });
  };

  
// Generate M-Pesa Access Token
const getAccessToken = async (consumerKey, consumerSecret) => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
};

// STK Push Route
router.post("/crowddonation", async (req, res) => {
    try {
        const { campaignId, phoneNumber, amount } = req.body;
        
        // Validate input
        if (!phoneNumber || !amount || !campaignId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Get campaign and M-Pesa details
        const campaign = await Crowdfunding.findById(campaignId).populate("mpesaAccount");
        if (!campaign || !campaign.mpesaAccount) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        // Prepare STK push
        const mpesaDetails = campaign.mpesaAccount;
        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = Buffer.from(`${mpesaDetails.businessShortCode}${mpesaDetails.passkey}${timestamp}`).toString("base64");
        const accessToken = await getAccessToken(mpesaDetails.consumerKey, mpesaDetails.consumerSecret);

        // Include campaignId in callback URL
        const callbackURL = `${mpesaDetails.callbackURL}?campaignId=${campaignId}`;

        const stkPushData = {
            BusinessShortCode: mpesaDetails.businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: mpesaDetails.businessShortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackURL,
            AccountReference: `CONTRIB-${campaignId}`,
            TransactionDesc: `Donation to ${campaign.campaignTitle}`
        };

        // Initiate STK push
        const stkResponse = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            stkPushData,
            { headers: { Authorization: `Bearer ${accessToken}` }
        });

        return res.status(200).json({ 
            success: true,
            message: "Payment request sent to phone",
            checkoutRequestID: stkResponse.data.CheckoutRequestID 
        });

    } catch (error) {
        console.error("STK Push Error:", error.message);
        return res.status(500).json({ 
            success: false,
            message: "Payment initiation failed"
        });
    }
});

// Callback Route
router.post("/callback", async (req, res) => {
    try {
        const campaignId = req.query.campaignId;
        if (!campaignId) {
            return res.status(400).json({ message: "Missing campaign reference" });
        }

        const callback = req.body.Body?.stkCallback;
        if (!callback) {
            return res.status(400).json({ message: "Invalid callback format" });
        }

        const success = callback.ResultCode === 0;
        const checkoutRequestId = callback.CheckoutRequestID;

        if (success) {
            const metadata = callback.CallbackMetadata?.Item || [];
            const getValue = (name) => metadata.find(i => i.Name === name)?.Value;

            // Create and save transaction
            const transaction = new CrowdFundingRecords({
                campaignId,
                amount: getValue("Amount"),
                phoneNumber: getValue("PhoneNumber"),
                mpesaReceiptNumber: getValue("MpesaReceiptNumber"),
                transactionDate: moment(getValue("TransactionDate"), "YYYYMMDDHHmmss").toDate(),
                status: "Completed"
            });
            await transaction.save();

            // Update campaign total
            await Crowdfunding.findByIdAndUpdate(
                campaignId,
                { $inc: { currentAmount: transaction.amount } }
            );
        }

        // Notify all clients subscribed to this campaign
        if (clients.has(campaignId)) {
            const message = JSON.stringify({
                event: 'payment_update',
                checkoutRequestId,
                success,
                campaignId
            });

            clients.get(campaignId).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                } else {
                    clients.get(campaignId).delete(client);
                }
            });
        }

        return res.status(200).json({ 
            message: success ? "Payment processed" : "Payment failed",
            success
        });

    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(500).json({ 
            message: "Callback processing failed",
            error: error.message 
        });
    }
});

module.exports = {
    router,
    handleWebSocketUpgrade
};