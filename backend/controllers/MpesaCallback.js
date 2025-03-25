const axios = require("axios");
const moment = require("moment");
const { Crowdfunding } = require("../models/crowdFundingSchema.model");
const { CrowdFundingRecords } = require("../models/CrowdFundingRecords.model");
const { MpesaAccountDetails } = require("../models/MpesaAccountDetails.model");

const router = require('express').Router();

// Generate M-Pesa Access Token
const getAccessToken = async (consumerKey, consumerSecret) => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    try {
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${auth}` },
        });

        return response.data.access_token;
    } catch (error) {
        console.error("M-Pesa OAuth Error:", error.response?.data || error.message);
        throw new Error("Failed to generate M-Pesa access token.");
    }
};

// STK Push Route
router.post("/stk-push", async (req, res) => {
    try {
        const { campaignId, phoneNumber, amount } = req.body;
        if (!phoneNumber || !amount || !campaignId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const campaign = await Crowdfunding.findById(campaignId).populate("mpesaAccount");
        if (!campaign || !campaign.mpesaAccount) {
            return res.status(404).json({ message: "Campaign not found." });
        }

        const mpesaDetails = campaign.mpesaAccount;
        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = Buffer.from(mpesaDetails.businessShortCode + mpesaDetails.passkey + timestamp).toString("base64");

        const accessToken = await getAccessToken(mpesaDetails.consumerKey, mpesaDetails.consumerSecret);

        const stkPushData = {
            BusinessShortCode: mpesaDetails.businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: mpesaDetails.businessShortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: mpesaDetails.callbackURL,
            AccountReference: campaign.campaignTitle,
            TransactionDesc: `Contribution to ${campaign.campaignTitle}`
        };

        const stkResponse = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            stkPushData,
            { 
                headers: { 
                    Authorization: `Bearer ${accessToken}`, 
                    "Content-Type": "application/json" 
                }
            }
        );

        if (stkResponse.data.ResponseCode === "0") {
            // Only return success response without saving transaction yet
            return res.status(200).json({ 
                message: "STK Push request sent successfully.", 
                checkoutRequestID: stkResponse.data.CheckoutRequestID 
            });
        } else {
            return res.status(400).json({ 
                message: "STK Push failed.", 
                response: stkResponse.data 
            });
        }
    } catch (error) {
        console.error("STK Push Error:", error);
        return res.status(500).json({ 
            message: "Internal Server Error.", 
            error: error.message 
        });
    }
});

// M-Pesa Callback Route
router.post("/callback", async (req, res) => {
    try {
        const { Body } = req.body;
        if (!Body || !Body.stkCallback) {
            return res.status(400).json({ message: "Invalid callback format." });
        }

        const callbackData = Body.stkCallback;
        console.log("STK Callback Data:", callbackData);

        if (callbackData.ResultCode === 0) {
            // Extract transaction details from callback
            const metadata = callbackData.CallbackMetadata?.Item || [];
            const amount = metadata.find(i => i.Name === "Amount")?.Value;
            const mpesaReceiptNumber = metadata.find(i => i.Name === "MpesaReceiptNumber")?.Value;
            const phoneNumber = metadata.find(i => i.Name === "PhoneNumber")?.Value;
            const transactionDate = metadata.find(i => i.Name === "TransactionDate")?.Value;
            console.log({amount, mpesaReceiptNumber, phoneNumber, transactionDate})
            if (!amount || !mpesaReceiptNumber || !phoneNumber) {
                return res.status(400).json({ message: "Missing required transaction details." });
            }

            // // Find campaign from AccountReference
            // const campaign = await Crowdfunding.findOne({ 
            //     campaignTitle: callbackData.MerchantRequestID || callbackData.CheckoutRequestID 
            // });
            
            // if (!campaign) {
            //     return res.status(404).json({ message: "Campaign not found." });
            // }

            // Create and save the transaction record
            const transaction = new CrowdFundingRecords({
                phoneNumber,
                amount,
                campaignId: campaign._id,
                transactionId: callbackData.CheckoutRequestID,
                mpesaReceiptNumber,
                transactionDate: transactionDate ? moment(transactionDate, "YYYYMMDDHHmmss").toDate() : new Date(),
                status: "Completed"
            });

            await transaction.save();

            // Update campaign total
            campaign.currentAmount += amount;
            await campaign.save();

            return res.status(200).json({ message: "Payment processed successfully." });

        } else {
            // Handle failed transaction (optional: you could log this or notify someone)
            console.log("Payment failed:", callbackData.ResultDesc);
            return res.status(200).json({ message: "Payment failed.", reason: callbackData.ResultDesc });
        }
    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(500).json({ 
            message: "Internal Server Error.", 
            error: error.message 
        });
    }
});

module.exports = router;